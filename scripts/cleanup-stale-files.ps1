# Borra archivos viejos que quedaron de una versión anterior con TypeORM o estructura previa.
$ErrorActionPreference = "SilentlyContinue"

Remove-Item "backend\src\bookings\booking.entity.ts" -Force
Remove-Item "backend\src\spaces\space.entity.ts" -Force
Remove-Item "backend\src\common\entities\base.entity.ts" -Force
Remove-Item "backend\src\common\entities" -Recurse -Force
Remove-Item "backend\src\common" -Recurse -Force

# Archivos viejos de frontend que no forman parte de la versión Prisma actual.
# No pasa nada si no existen.
Remove-Item "frontend\src\data\demoSpaces.ts" -Force
Remove-Item "frontend\src\data" -Recurse -Force
Remove-Item "frontend\src\lib\api.ts" -Force
Remove-Item "frontend\src\lib" -Recurse -Force

Write-Host "Limpieza terminada. Ahora corré npm install en backend y frontend." -ForegroundColor Green
