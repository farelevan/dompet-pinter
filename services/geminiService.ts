import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppState } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFinancialAdvice = async (
  query: string,
  context: AppState
): Promise<string> => {
  if (!apiKey) {
    return "API Key belum dikonfigurasi. Mohon atur process.env.API_KEY.";
  }

  // Summarize context for the model
  const totalIncome = context.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpense = context.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const portfolioValue = context.investments.reduce(
    (acc, inv) => acc + inv.quantity * inv.currentPrice, 
    0
  );

  const contextPrompt = `
    Konteks Keuangan Pengguna:
    - Total Pemasukan: IDR ${totalIncome.toLocaleString('id-ID')}
    - Total Pengeluaran: IDR ${totalExpense.toLocaleString('id-ID')}
    - Sisa Saldo Kas: IDR ${(totalIncome - totalExpense).toLocaleString('id-ID')}
    - Nilai Portofolio Investasi: IDR ${portfolioValue.toLocaleString('id-ID')}
    
    Detail Investasi:
    ${context.investments.map(inv => `- ${inv.name} (${inv.type}): ${inv.quantity} unit @ IDR ${inv.currentPrice}`).join('\n')}

    Tujuan Tabungan:
    ${context.goals.map(g => `- ${g.name} (${g.type}): Tercapai IDR ${g.currentAmount} / Target IDR ${g.targetAmount}`).join('\n')}
    
    Pertanyaan Pengguna: "${query}"
    
    Berikan saran keuangan yang bijak, ringkas, dan dapat ditindaklanjuti dalam Bahasa Indonesia. Fokus pada alokasi aset, manajemen risiko, dan pencapaian tujuan.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contextPrompt,
    });
    return response.text || "Maaf, saya tidak dapat memberikan saran saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
};