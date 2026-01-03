"use strict";
"use client";

import { useState } from "react";
import { generateWeightedBarcode } from "@/lib/barcode";
import { Copy, Scale, ArrowRight, RefreshCw, Calculator } from "lucide-react";

export default function ScaleSimulatorPage() {
    const [plu, setPlu] = useState("502");
    const [weight, setWeight] = useState(1.25);
    const [generatedCode, setGeneratedCode] = useState("");

    const handleGenerate = () => {
        const code = generateWeightedBarcode(plu, weight);
        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        // Ideally show a toast here
    };

    // Auto-generate when inputs change
    // useEffect(() => { handleGenerate() }, [plu, weight]); 

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Scale className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Scale Simulator</h1>
                    <p className="text-slate-500">Generate test barcodes for weighted items</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-slate-400" />
                        Scale Inputs
                    </h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Scale PLU (Product Code)</label>
                            <input
                                type="text"
                                value={plu}
                                onChange={(e) => setPlu(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition font-mono text-lg"
                                placeholder="e.g. 502"
                            />
                            <p className="text-xs text-slate-400">Enter the 1-5 digit code assigned to the product (e.g. 502)</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Weight (Kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                                step="0.001"
                                min="0"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition font-mono text-lg"
                                placeholder="e.g. 1.250"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Generate Barcode
                    </button>
                </div>

                {/* Output */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Scale className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 text-center space-y-6">
                            <div className="text-slate-400 text-sm font-mono tracking-widest uppercase">
                                Generated Barcode
                            </div>

                            {generatedCode ? (
                                <div className="space-y-4">
                                    <div className="font-mono text-4xl sm:text-5xl font-bold tracking-wider text-white">
                                        {generatedCode}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy to Clipboard
                                    </button>
                                </div>
                            ) : (
                                <div className="py-8 text-slate-500 italic">
                                    Click Generate...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Breakdown */}
                    {generatedCode && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-800">Barcode Structure</h3>
                            <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    <div className="font-bold text-slate-900">21</div>
                                    <div className="text-xs text-slate-500">Prefix</div>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <div className="font-bold text-blue-700">{generatedCode.substring(2, 7)}</div>
                                    <div className="text-xs text-blue-400">PLU</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <div className="font-bold text-green-700">{generatedCode.substring(7, 12)}</div>
                                    <div className="text-xs text-green-400">Weight (g)</div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <div className="font-bold text-purple-700">{generatedCode.substring(12)}</div>
                                    <div className="text-xs text-purple-400">Check</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center pt-2">
                                <span>Note: System strips leading zeros from PLU during Scan.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
