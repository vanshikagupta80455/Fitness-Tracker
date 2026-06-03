import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@fitness.local" },
    update: {},
    create: {
      name: "Demo Athlete",
      email: "demo@fitness.local",
      passwordHash
    }
  });

  const existingWorkouts = await prisma.workout.count({ where: { userId: user.id } });

  if (existingWorkouts === 0) {
    await prisma.workout.create({
      data: {
        userId: user.id,
        title: "Upper Body Strength",
        date: new Date(),
        notes: "Controlled tempo and full range of motion.",
        exercises: {
          create: [
            { name: "Bench Press", sets: 4, reps: 8, weight: 70, calories: 120 },
            { name: "Lat Pulldown", sets: 3, reps: 10, weight: 55, calories: 95 }
          ]
        }
      }
    });

    await prisma.workout.create({
      data: {
        userId: user.id,
        title: "Cardio Base",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        notes: "Easy pace treadmill session.",
        exercises: {
          create: [{ name: "Treadmill Run", duration: 35, calories: 310 }]
        }
      }
    });
  }

  const existingGoals = await prisma.goal.count({ where: { userId: user.id } });

  if (existingGoals === 0) {
    await prisma.goal.createMany({
      data: [
        {
          userId: user.id,
          title: "Complete 16 workouts",
          type: "Workout Count",
          targetValue: 16,
          currentValue: 5,
          unit: "workouts",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        },
        {
          userId: user.id,
          title: "Burn 6000 calories",
          type: "Calories",
          targetValue: 6000,
          currentValue: 1725,
          unit: "calories",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45)
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
