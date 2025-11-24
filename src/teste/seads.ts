import { prisma } from "../shared/libs/prisma.js";

const FunnelStages = [
    { id: 1, name: "Prospecção", order: 1, isClosed: false },
    { id: 2, name: "Qualificação", order: 2, isClosed: false },
    { id: 3, name: "Apresentação", order: 3, isClosed: false },
    { id: 4, name: "Negociação", order: 4, isClosed: false },
    { id: 5, name: "Fechado (Ganho)", order: 5, isClosed: true },
    { id: 6, name: "Fechado (Perdido)", order: 6, isClosed: true },
];

async function main() {
    console.log("Iniciando a população de dados...");

    for (const stage of FunnelStages) {
        await prisma.salesFunnelStage.upsert({
            where: { id: stage.id },
            update: {},
            create: stage,
        });
    }

    console.log("População Concluida.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
