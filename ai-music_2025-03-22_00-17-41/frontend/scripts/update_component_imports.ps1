$files = Get-ChildItem -Path "src/app/future_capabilities" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Update component imports
    $content = $content -replace "@/components/future-capabilities/", "@/components/future_capabilities/"
    $content = $content -replace "future_capabilities/data-table", "future_capabilities/data_table"
    $content = $content -replace "future_capabilities/data-form", "future_capabilities/data_form"
    $content = $content -replace "future_capabilities/data-table-column-header", "future_capabilities/data_table_column_header"
    $content = $content -replace "future_capabilities/data-table-row-actions", "future_capabilities/data_table_row_actions"

    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated imports in $($file.Name)"
}

Write-Host "Import paths updated successfully!" 