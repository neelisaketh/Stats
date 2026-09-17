import type { Metadata } from "next";
import { TestLab } from "@/components/test-lab";
export const metadata: Metadata = { title: "Inference Test Lab" };
export default function PracticePage(){ return <TestLab />; }
