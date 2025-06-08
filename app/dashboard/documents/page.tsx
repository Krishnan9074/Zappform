import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { getSession } from "next-auth/react";
import DocumentList from "@/app/components/documents/DocumentList";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  const documents = await prisma.userDocument.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <DocumentList documents={documents} />;
} 