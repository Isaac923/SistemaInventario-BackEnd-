import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  try {
    console.log("Conectando a la base de datos...")
    // Intentamos contar cuántos registros hay en una tabla
    // Si tu tabla se llama 'Producto', usa prisma.producto
    const count = await prisma.$queryRaw`SELECT 1+1 AS result`
    console.log("✅ Conexión exitosa. Resultado de prueba:", count)
    
    // Si quieres ver datos reales, usa:
    // const datos = await prisma.NOMBRE_DE_TU_MODELO.findMany()
    // console.log(datos)

  } catch (error) {
    console.error("❌ Error conectando a la DB:", error)
  } finally {
    await prisma.$disconnect()
  }
}

test()