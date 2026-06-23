import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clients
  const pedro = await prisma.client.create({
    data: {
      name: "Pedro Rodríguez",
      phone: "+1 (787) 555-1001",
      email: "pedro.rodriguez@email.com",
    },
  });

  const maria = await prisma.client.create({
    data: {
      name: "María González",
      phone: "+1 (787) 555-2002",
      email: "maria.gonzalez@email.com",
    },
  });

  // Vehicles
  const v911 = await prisma.vehicle.create({
    data: {
      vin: "WP0AA2A97KS100001",
      plate: "EBD-123",
      make: "Porsche",
      model: "911 Carrera",
      year: 2019,
      color: "Guards Red",
      clientId: pedro.id,
    },
  });

  const vCayenne = await prisma.vehicle.create({
    data: {
      vin: "WP1AA2AY9KDA10002",
      plate: "KMR-456",
      make: "Porsche",
      model: "Cayenne",
      year: 2021,
      color: "Jet Black",
      clientId: pedro.id,
    },
  });

  const vBoxster = await prisma.vehicle.create({
    data: {
      vin: "WP0CA2A87KU200003",
      plate: "LPQ-789",
      make: "Porsche",
      model: "Boxster",
      year: 2018,
      color: "Miami Blue",
      clientId: maria.id,
    },
  });

  // Repair Orders
  await prisma.repairOrder.create({
    data: {
      vehicleId: v911.id,
      status: "DIAGNOSING",
      description: "Revisión de motor — ruido inusual al acelerar",
      notes: "Cliente reporta golpeteo al pasar de 3,000 RPM",
      lineItems: {
        create: [
          { type: "LABOR", description: "Diagnóstico general", quantity: 2, unitPrice: 95 },
        ],
      },
    },
  });

  await prisma.repairOrder.create({
    data: {
      vehicleId: vCayenne.id,
      status: "WAITING_PARTS",
      description: "Cambio de frenos delanteros y traseros",
      notes: "En espera de pastillas Brembo OEM",
      lineItems: {
        create: [
          { type: "LABOR", description: "Cambio de frenos (4 ruedas)", quantity: 3, unitPrice: 95 },
          { type: "PART", description: "Pastillas Brembo delanteras", quantity: 1, unitPrice: 280, partNumber: "PAD-BRE-CAY-F" },
          { type: "PART", description: "Pastillas Brembo traseras", quantity: 1, unitPrice: 240, partNumber: "PAD-BRE-CAY-R" },
        ],
      },
    },
  });

  await prisma.repairOrder.create({
    data: {
      vehicleId: vBoxster.id,
      status: "IN_REPAIR",
      description: "Reemplazo de correa de distribución y tensores",
      notes: "Mantenimiento preventivo a 80,000 km",
      lineItems: {
        create: [
          { type: "LABOR", description: "Reemplazo de correa de distribución", quantity: 5, unitPrice: 95 },
          { type: "PART", description: "Kit correa distribución OEM", quantity: 1, unitPrice: 420, partNumber: "BELT-BOX-KIT" },
        ],
      },
    },
  });

  await prisma.repairOrder.create({
    data: {
      vehicleId: v911.id,
      status: "READY",
      description: "Servicio de aceite y filtros — 10,000 km",
      notes: "Aceite Mobil 1 5W-50 utilizado",
      lineItems: {
        create: [
          { type: "LABOR", description: "Cambio de aceite y filtro", quantity: 1, unitPrice: 95 },
          { type: "PART", description: "Aceite Mobil 1 5W-50 (5L)", quantity: 1, unitPrice: 65, partNumber: "OIL-MOB-5W50" },
          { type: "PART", description: "Filtro de aceite OEM", quantity: 1, unitPrice: 35, partNumber: "FLT-911-OIL" },
        ],
      },
    },
  });

  await prisma.repairOrder.create({
    data: {
      vehicleId: vCayenne.id,
      status: "DELIVERED",
      description: "Revisión de suspensión — ruido en curvas",
      notes: "Se reemplazaron bujes de barra estabilizadora",
      lineItems: {
        create: [
          { type: "LABOR", description: "Diagnóstico y reparación de suspensión", quantity: 4, unitPrice: 95 },
          { type: "PART", description: "Bujes barra estabilizadora", quantity: 2, unitPrice: 85, partNumber: "BUSH-CAY-STAB" },
        ],
      },
    },
  });

  // Parts Inventory
  const parts = [
    { partNumber: "PAD-BRE-CAY-F", description: "Pastillas Brembo delanteras Cayenne", brand: "Brembo", location: "A-3", stock: 4, unitCost: 280, compatibleWith: "Porsche Cayenne 2018-2023" },
    { partNumber: "PAD-BRE-CAY-R", description: "Pastillas Brembo traseras Cayenne", brand: "Brembo", location: "A-4", stock: 3, unitCost: 240, compatibleWith: "Porsche Cayenne 2018-2023" },
    { partNumber: "BELT-BOX-KIT", description: "Kit correa de distribución Boxster", brand: "OEM Porsche", location: "B-1", stock: 2, unitCost: 420, compatibleWith: "Porsche Boxster 2012-2020" },
    { partNumber: "OIL-MOB-5W50", description: "Aceite Mobil 1 5W-50 5L", brand: "Mobil", location: "C-2", stock: 12, unitCost: 65, compatibleWith: "Porsche 911, Boxster, Cayman" },
    { partNumber: "FLT-911-OIL", description: "Filtro de aceite OEM 911", brand: "OEM Porsche", location: "C-3", stock: 8, unitCost: 35, compatibleWith: "Porsche 911 2012-2023" },
    { partNumber: "BUSH-CAY-STAB", description: "Bujes barra estabilizadora Cayenne", brand: "OEM Porsche", location: "D-1", stock: 6, unitCost: 85, compatibleWith: "Porsche Cayenne 2016-2022" },
    { partNumber: "SPARK-911-SET", description: "Set bujías OEM 911 (6 pcs)", brand: "NGK", location: "C-5", stock: 5, unitCost: 120, compatibleWith: "Porsche 911 Carrera 2016-2023" },
    { partNumber: "AIR-FLT-CAY", description: "Filtro de aire Cayenne", brand: "Mann", location: "C-4", stock: 7, unitCost: 45, compatibleWith: "Porsche Cayenne 2018-2023" },
    { partNumber: "ROTOR-F-911", description: "Rotores delanteros 911", brand: "OEM Porsche", location: "A-1", stock: 2, unitCost: 380, compatibleWith: "Porsche 911 GT3 2017-2022" },
    { partNumber: "COOLANT-PR", description: "Refrigerante Porsche Original 1L", brand: "OEM Porsche", location: "C-6", stock: 15, unitCost: 22, compatibleWith: "Todos los modelos Porsche" },
  ];

  for (const part of parts) {
    await prisma.part.create({ data: part });
  }

  // Repair Guides
  const guides = [
    {
      title: "Cambio de aceite — Porsche 911 (992)",
      model: "911",
      year: "2019-2023",
      category: "Mantenimiento",
      steps: JSON.stringify([
        { title: "Preparación", description: "Levantar el vehículo con gato hidráulico. Colocar soporte seguro bajo el chasis." },
        { title: "Drenar aceite viejo", description: "Retirar el tapón de drenaje (llave 17mm). Dejar drenar completamente por 10 minutos.", warning: "El aceite puede estar caliente. Usar guantes de protección." },
        { title: "Cambiar filtro de aceite", description: "Usar llave de filtro 76mm. Lubricar el nuevo filtro con aceite limpio antes de instalar." },
        { title: "Colocar tapón", description: "Instalar tapón nuevo con torque de 25 Nm. No apretarlo en exceso." },
        { title: "Agregar aceite nuevo", description: "Agregar 8.75L de Mobil 1 5W-50 por el tapón superior. Verificar nivel con varilla." },
        { title: "Verificar fugas", description: "Encender motor por 2 minutos. Inspeccionar por fugas. Verificar nivel nuevamente." },
      ]),
      notes: "Intervalo recomendado: cada 10,000 km o 1 año.",
    },
    {
      title: "Cambio de pastillas de freno — Cayenne",
      model: "Cayenne",
      year: "2018-2023",
      category: "Frenos",
      steps: JSON.stringify([
        { title: "Retirar rueda", description: "Aflojar tornillos en cruz antes de levantar el vehículo. Retirar rueda." },
        { title: "Comprimir pistón del caliper", description: "Usar compresor de pistón. Abrir depósito de frenos antes de comprimir.", warning: "No dejar líquido de frenos desbordarse — irrita la piel y daña la pintura." },
        { title: "Retirar pastillas viejas", description: "Quitar pins de retención con alicate. Deslizar pastillas viejas hacia afuera." },
        { title: "Limpiar caliper", description: "Limpiar ranuras del caliper con cepillo metálico. Aplicar grasa alta temperatura en los guías." },
        { title: "Instalar pastillas nuevas", description: "Insertar pastillas nuevas. Verificar que los clips de retención estén bien asentados." },
        { title: "Sangrar frenos si necesario", description: "Bombear pedal de freno 10 veces con motor apagado hasta sentir presión firme." },
      ]),
      notes: "Verificar espesor de rotores. Mínimo 28mm delantero, 22mm trasero.",
    },
    {
      title: "Diagnóstico de ruidos en suspensión — Boxster/Cayman",
      model: "Boxster",
      year: "2012-2020",
      category: "Suspensión",
      steps: JSON.stringify([
        { title: "Identificar el ruido", description: "Determinar si el ruido ocurre: en curvas, sobre baches, al frenar, o constantemente. Esto guía el diagnóstico." },
        { title: "Inspección visual en foso", description: "Revisar bujes de barra estabilizadora, rótulas, brazos de control, y amortighuadores por signos de deterioro." },
        { title: "Prueba de sacudida", description: "Con el vehículo levantado, sacudir cada rueda en posición 12-6 (desgaste de cojinete) y 3-9 (holgura de rótula).", warning: "Nunca trabajar bajo un vehículo soportado solo por un gato." },
        { title: "Verificar amortiguadores", description: "Presionar cada esquina del vehículo. Debe rebotar una sola vez. Más de un rebote indica amortiguador desgastado." },
        { title: "Torques de inspección", description: "Verificar torques de todos los puntos de sujeción de la suspensión según especificaciones del taller." },
      ]),
      notes: "Ruidos al girar a baja velocidad generalmente indican bujes de barra estabilizadora. Ruidos sobre baches apuntan a amortiguadores.",
    },
  ];

  for (const guide of guides) {
    await prisma.repairGuide.create({ data: guide });
  }

  console.log("✅ Seed completado — 2 clientes, 3 vehículos, 5 órdenes, 10 piezas, 3 guías");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
