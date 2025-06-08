import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import HistoryList from "@/app/components/history/HistoryList";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const submissions = await prisma.formSubmission.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { formTemplate: true },
  });

  return <HistoryList submissions={submissions} />;
} 