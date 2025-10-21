$files = Get-ChildItem -Path "src/app/future_capabilities" -Recurse -Include "*.ts","*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Update component imports
    $content = $content -replace "@/components/future-capabilities/", "@/components/future_capabilities/"
    $content = $content -replace "@/components/future_capabilities/data-table-column-header", "@/components/future_capabilities/data_table_column_header"
    $content = $content -replace "@/components/future_capabilities/data-table-row-actions", "@/components/future_capabilities/data_table_row_actions"
    $content = $content -replace "@/components/future_capabilities/data-table", "@/components/future_capabilities/data_table"
    $content = $content -replace "@/components/future_capabilities/data-form", "@/components/future_capabilities/data_form"

    # Update API imports
    $content = $content -replace "@/lib/api/future-capabilities", "@/lib/api/future_capabilities"
    $content = $content -replace "@/lib/types/future-capabilities", "@/lib/types/future_capabilities"

    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated imports in $($file.Name)"
}

Write-Host "Import paths updated successfully!" 