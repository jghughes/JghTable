#Requires -Version 7.0
<#
.SYNOPSIS
    Builds the shared framework and uploads it to the Azure Storage static site.

.DESCRIPTION
    Mirrors the HP21 deploy script pattern: validate the environment, clean and build,
    preview the deletion of stale blobs, require explicit confirmation, and upload only
    the compiled dist files and CSS needed by the apps at runtime.

.PARAMETER StorageAccountName
    Azure Storage account hosting the static website.

.PARAMETER ResourceGroupName
    Resource group containing the storage account.
#>
param(
    [string]$StorageAccountName = "customerzsun",
    [string]$ResourceGroupName = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Resolve-Path (Join-Path $scriptDir "..")
$sourceFolder = Join-Path $projectDir "shared-mastercopies"
$targetPath = "shared-mastercopies"
$containerName = '$web'

function Get-StorageAccountKey {
    param(
        [string]$StorageAccountName,
        [string]$ResourceGroupName
    )

    $args = @(
        "storage", "account", "keys", "list",
        "--account-name", $StorageAccountName,
        "--query", "[0].value",
        "-o", "tsv"
    )

    if (-not [string]::IsNullOrWhiteSpace($ResourceGroupName)) {
        $args += @("--resource-group", $ResourceGroupName)
    }

    $accountKey = & az @args
    if ($LASTEXITCODE -ne 0 -or -not $accountKey) {
        throw "Failed to resolve an account key for storage account '$StorageAccountName'. Verify the account name and resource group are correct."
    }

    return $accountKey.Trim()
}

function Test-StaticWebsiteEnabled {
    param([string]$StorageAccountName, [string]$AccountKey)

    Write-Host "Validating static website hosting is enabled..." -ForegroundColor Cyan

    $siteProps = & az storage blob service-properties show `
        --account-name $StorageAccountName `
        --account-key $AccountKey `
        --query "staticWebsite" | ConvertFrom-Json

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to read static website properties for storage account '$StorageAccountName' (exit code $LASTEXITCODE)."
    }

    if (-not $siteProps -or -not $siteProps.enabled) {
        throw @"
Static website hosting is not enabled on storage account '$StorageAccountName'.

To enable it, run:
  az storage blob service-properties update `
    --account-name $StorageAccountName `
    --static-website `
    --index-document index.html

Then re-run this deployment script.
"@
    }
}

function Remove-SourceMaps {
    param([string]$DistPath)

    Write-Host "Cleaning up TypeScript source maps..." -ForegroundColor Cyan

    $mapFiles = @(Get-ChildItem -Path $DistPath -Recurse -Filter "*.map" -ErrorAction SilentlyContinue)
    if ($mapFiles.Count -gt 0) {
        foreach ($file in $mapFiles) {
            Write-Host "  Removed: $($file.Name)" -ForegroundColor Gray
            Remove-Item -Path $file.FullName -Force
        }
        Write-Host "  Removed $($mapFiles.Count) source map file(s)" -ForegroundColor Green
    }
    else {
        Write-Host "  No source maps found" -ForegroundColor Green
    }
}

function Get-ExistingBlobNames {
    param([string]$StorageAccountName, [string]$AccountKey, [string]$Prefix)

    $existingBlobs = & az storage blob list `
        --account-name $StorageAccountName `
        --account-key $AccountKey `
        --container-name '$web' `
        --prefix $Prefix `
        --query "[].name" -o tsv

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to list existing blobs under `$web/$Prefix (exit code $LASTEXITCODE)."
    }

    if (-not $existingBlobs) {
        return @()
    }

    return @($existingBlobs -split "`n" | Where-Object { $_ })
}

function Remove-ExistingBlobs {
    param([string]$StorageAccountName, [string]$AccountKey, [string]$Prefix)

    & az storage blob delete-batch `
        --account-name $StorageAccountName `
        --account-key $AccountKey `
        --source '$web' `
        --pattern "$Prefix*" | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to delete existing blobs under `$web/$Prefix (exit code $LASTEXITCODE)."
    }
}

function Show-UploadPreview {
    param([string]$SourcePath, [string]$Destination)

    if (-not (Test-Path $SourcePath)) {
        if ($Destination -like '*dist*') {
            Write-Host "  - (skipped: missing directory $SourcePath)" -ForegroundColor Gray
        }
        return
    }

    $files = @(Get-ChildItem -Path $SourcePath -Recurse -File | Where-Object { $_.Extension -in '.html', '.css', '.js' -and $_.FullName -notlike (Join-Path $SourcePath 'dist\*') })
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring((Resolve-Path $SourcePath).Path.Length + 1) -replace '\\', '/'
        Write-Host "  - `$web/$Destination/$relativePath" -ForegroundColor Yellow
    }
}

function Get-StorageWebsiteUrl {
    param([string]$StorageAccountName)

    return "https://${StorageAccountName}.blob.core.windows.net/`$web/$targetPath/base-grid.css"
}

function Get-UploadFileCount {
    param([string]$SourcePath, [string]$Pattern)

    if (-not (Test-Path $SourcePath)) {
        return 0
    }

    if ($Pattern -eq '*') {
        return @(Get-ChildItem -Path $SourcePath -Recurse -File -ErrorAction SilentlyContinue).Count
    }

    return @(Get-ChildItem -Path $SourcePath -Recurse -File -Filter $Pattern -ErrorAction SilentlyContinue).Count
}

function Invoke-UploadBatch {
    param(
        [string]$SourcePath,
        [string]$Destination,
        [string]$Pattern,
        [string]$FolderName,
        [string]$AccountKey
    )

    if (-not (Test-Path $SourcePath)) {
        Write-Host "Skipped upload for missing directory: $SourcePath" -ForegroundColor Gray
        return 0
    }

    $fileCount = Get-UploadFileCount -SourcePath $SourcePath -Pattern $Pattern

    & az storage blob upload-batch `
        --account-name $StorageAccountName `
        --account-key $AccountKey `
        --destination $containerName `
        --destination-path $Destination `
        --source $SourcePath `
        --pattern $Pattern `
        --content-cache-control "no-cache" `
        --overwrite `
        --only-show-errors | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to upload '$SourcePath' to `$web/$Destination (exit code $LASTEXITCODE)"
    }

    Write-Host "Uploaded folder: $FolderName -> $Destination ($fileCount files)" -ForegroundColor Green
    return $fileCount
}

Write-Host "Verifying Azure CLI login..." -ForegroundColor Cyan
& az account show --query "user.name" -o tsv | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Not logged in to Azure CLI (or session expired). Run 'az login' and try again."
}

Write-Host "Resolving storage account key..." -ForegroundColor Cyan
$accountKey = Get-StorageAccountKey -StorageAccountName $StorageAccountName -ResourceGroupName $ResourceGroupName
Test-StaticWebsiteEnabled -StorageAccountName $StorageAccountName -AccountKey $accountKey

$distPath = Join-Path $sourceFolder "dist"
Write-Host "Cleaning previous build output for '$targetPath'..." -ForegroundColor Cyan
if (Test-Path $distPath) {
    Remove-Item -Path $distPath -Recurse -Force
    Write-Host "  Removed: $distPath" -ForegroundColor Gray
}
else {
    Write-Host "  No dist folder found for '$targetPath'" -ForegroundColor Gray
}

Write-Host "Building TypeScript project for '$targetPath'..." -ForegroundColor Cyan
Push-Location $sourceFolder
try {
    & npx tsc --build .\tsconfig.json --force
    if ($LASTEXITCODE -ne 0) {
        throw "npx tsc --build failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

Remove-SourceMaps -DistPath $distPath

$existingBlobNames = Get-ExistingBlobNames -StorageAccountName $StorageAccountName -AccountKey $accountKey -Prefix "$targetPath/"

Write-Host "The following $($existingBlobNames.Count) blob(s) will be DELETED from `$web/$targetPath/ before upload:" -ForegroundColor Yellow
if ($existingBlobNames.Count -eq 0) {
    Write-Host "  (none)" -ForegroundColor Yellow
}
else {
    foreach ($name in $existingBlobNames) {
        Write-Host "  - $name" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "The following file(s) will be uploaded to `$web:" -ForegroundColor Yellow
Show-UploadPreview -SourcePath (Join-Path $sourceFolder "dist") -Destination "$targetPath/dist"
Show-UploadPreview -SourcePath $sourceFolder -Destination $targetPath
Write-Host ""

$confirmation = Read-Host "Type 'yes' to proceed with deletion and upload, or anything else to abort"
if ($confirmation -ne "yes") {
    throw "Deployment aborted by user before deleting/uploading."
}
Write-Host ""

if ($existingBlobNames.Count -gt 0) {
    Remove-ExistingBlobs -StorageAccountName $StorageAccountName -AccountKey $accountKey -Prefix "$targetPath/"
}
Write-Host "Deleted $($existingBlobNames.Count) blob(s)" -ForegroundColor Green
Write-Host ""

Write-Host "Deploying shared-mastercopies to Azure Blob Storage..." -ForegroundColor Cyan
$uploadedCount = 0
$distPath = Join-Path $sourceFolder "dist"
if (Test-Path $distPath) {
    $uploadedCount += Invoke-UploadBatch -SourcePath $distPath -Destination "$targetPath/dist" -Pattern '*.js' -FolderName $targetPath -AccountKey $accountKey
}
else {
    Write-Host "No dist folder generated for '$targetPath'; skipping JS upload." -ForegroundColor Yellow
}

$uploadedCount += Invoke-UploadBatch -SourcePath $sourceFolder -Destination $targetPath -Pattern '*.css' -FolderName $targetPath -AccountKey $accountKey

Write-Host "Uploaded $uploadedCount file(s)" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host ""
Write-Host "The shared framework is now live at:" -ForegroundColor Green
Write-Host "  $(Get-StorageWebsiteUrl -StorageAccountName $StorageAccountName)" -ForegroundColor White
Write-Host ""
Write-Host "Note: It may take a few minutes for the site to be fully available." -ForegroundColor Yellow
