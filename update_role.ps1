
$users = Invoke-RestMethod -Uri "http://localhost:3000/api/users"
foreach ($u in $users) {
    if ($u.email -eq "johngin@gmail.com") {
        Write-Host "Found User: $($u.uid)"
        $body = @{
            uid = $u.uid
            email = $u.email
            role = "instructor"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $body -ContentType "application/json"
        Write-Host "SUCCESS: Role Updated"
        exit
    }
}
Write-Host "User not found"
