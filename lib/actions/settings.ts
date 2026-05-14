"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-utils";

const settingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  logo: z.string().optional().default(""),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  taxNumber: z.string().optional().default(""),
  website: z.string().optional().default(""),
  faxNumber: z.string().optional().default(""),
  companySubtitle: z.string().optional().default(""),
  footerDetails: z.string().optional().default(""),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  currency: z.string().min(1, "Currency is required"),
  termsAndConditions: z.string().optional().default(""),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export async function getSettings() {
  let settings = await prisma.companySettings.findFirst();

  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        companyName: "Workshop Pro",
        invoicePrefix: "INV",
        currency: "Rs.",
      },
    });
  }

  return settings;
}

export async function updateSettings(data: SettingsFormData) {
  await requireRole(["ADMIN", "MANAGER"]);

  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { companyName, logo, address, phone, email, taxNumber, website, faxNumber, companySubtitle, footerDetails, invoicePrefix, currency, termsAndConditions } = parsed.data;

  let settings = await prisma.companySettings.findFirst();

  if (settings) {
    settings = await prisma.companySettings.update({
      where: { id: settings.id },
      data: {
        companyName,
        logo: logo || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        taxNumber: taxNumber || null,
        website: website || null,
        faxNumber: faxNumber || null,
        companySubtitle: companySubtitle || null,
        footerDetails: footerDetails || null,
        invoicePrefix,
        currency,
        termsAndConditions: termsAndConditions || null,
      },
    });
  } else {
    settings = await prisma.companySettings.create({
      data: {
        companyName,
        logo: logo || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        taxNumber: taxNumber || null,
        website: website || null,
        faxNumber: faxNumber || null,
        companySubtitle: companySubtitle || null,
        footerDetails: footerDetails || null,
        invoicePrefix,
        currency,
        termsAndConditions: termsAndConditions || null,
      },
    });
  }

  revalidatePath("/settings");
  return { success: true as const, settings };
}
