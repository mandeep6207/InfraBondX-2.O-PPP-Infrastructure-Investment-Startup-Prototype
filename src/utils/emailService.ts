import emailjs from "@emailjs/browser";

type EmailResult = {
  success: boolean;
  error?: string;
};

type ProjectApprovedEmailData = {
  user_name: string;
  project_name: string;
  location: string;
  roi: string | number;
  min_invest: string | number;
  to_email: string;
};

type InvestmentEmailData = {
  user_name: string;
  project_name: string;
  amount: string | number;
  tokens: string | number;
  roi: string | number;
  rewards: string;
  to_email: string;
};

type WithdrawEmailData = {
  user_name: string;
  amount: string | number;
  to_email: string;
};

const ACCOUNT_1 = {
  serviceId: "service_g1svg2s",
  templateId: "template_tm4rraq",
  publicKey: "3jhp-SSoblnNV4C5P",
};

const ACCOUNT_2 = {
  serviceId: "service_4420d44",
  publicKey: "J_bJcu1BkSC_CAFvl",
  investmentTemplateId: "template_8wd2nvb",
  withdrawTemplateId: "template_zysme4a",
};

async function sendEmail(
  serviceId: string,
  templateId: string,
  publicKey: string,
  templateParams: Record<string, string | number>
): Promise<EmailResult> {
  try {
    await emailjs.send(serviceId, templateId, templateParams, { publicKey });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.text || error?.message || "Email send failed",
    };
  }
}

export async function sendProjectApprovedEmail(
  data: ProjectApprovedEmailData
): Promise<EmailResult> {
  return sendEmail(
    ACCOUNT_1.serviceId,
    ACCOUNT_1.templateId,
    ACCOUNT_1.publicKey,
    {
      user_name: data.user_name,
      project_name: data.project_name,
      location: data.location,
      roi: data.roi,
      min_invest: data.min_invest,
      to_email: data.to_email,
    }
  );
}

export async function sendInvestmentEmail(
  data: InvestmentEmailData
): Promise<EmailResult> {
  return sendEmail(
    ACCOUNT_2.serviceId,
    ACCOUNT_2.investmentTemplateId,
    ACCOUNT_2.publicKey,
    {
      user_name: data.user_name,
      project_name: data.project_name,
      amount: data.amount,
      tokens: data.tokens,
      roi: data.roi,
      rewards: data.rewards,
      to_email: data.to_email,
    }
  );
}

export async function sendWithdrawEmail(
  data: WithdrawEmailData
): Promise<EmailResult> {
  return sendEmail(
    ACCOUNT_2.serviceId,
    ACCOUNT_2.withdrawTemplateId,
    ACCOUNT_2.publicKey,
    {
      user_name: data.user_name,
      amount: data.amount,
      to_email: data.to_email,
    }
  );
}
