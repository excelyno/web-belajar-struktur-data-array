"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePythonMemoryStore } from "@/store/usePythonMemoryStore";

const MemoryInspectorModal = ({ node, onClose }: { node: any, onClose: () => void }) => {
  if (!node) return null;

  const renderStructContent = () => {
    if (node.isPointerBlock) {
      return (
        <div className="space-y-2 text-slate-300">
          <p className="text-emerald-400 mb-2">// Raw C Array (Contiguous Memory)</p>
          <p>Ini BUKAN PyObject. Ini adalah murni deretan memori berukuran statis yang disewa oleh PyListObject dari Sistem Operasi.</p>
          <div className="bg-[#050608] p-3 rounded border border-slate-700 font-mono text-xs">
            <span className="text-blue-400">PyObject</span> **ob_item = [<br/>
            &nbsp;&nbsp;<span className="text-slate-500">/* Index {node.index} */</span> <span className="text-yellow-300">{node.targetAddress || 'NULL'}</span><br/>
            ];
          </div>
        </div>
      );
    }

    let structName = "PyObject";
    let extraFields = null;

    if (node.type === "int") {
      structName = "PyLongObject";
      extraFields = (
        <>
          <span className="text-slate-500">/* Jumlah digit memori (basis 2^30) */</span><br/>
          <span className="text-blue-400">Py_ssize_t</span> ob_size = <span className="text-emerald-400">1</span>;<br/><br/>
          <span className="text-slate-500">/* Array digit yang menyimpan nilai aktual */</span><br/>
          <span className="text-blue-400">uint32_t</span> ob_digit[1] = &#123;<span className="text-emerald-400">{node.value}</span>&#125;;
        </>
      );
    } else if (node.type === "str") {
      structName = "PyUnicodeObject";
      extraFields = (
        <>
          <span className="text-slate-500">/* Panjang karakter string */</span><br/>
          <span className="text-blue-400">Py_ssize_t</span> length = <span className="text-emerald-400">{String(node.value).length}</span>;<br/><br/>
          <span className="text-blue-400">void</span> *data = <span className="text-emerald-400">"{node.value}"</span>;
        </>
      );
    } else if (node.type === "list") {
      structName = "PyListObject";
      extraFields = (
        <>
          <span className="text-slate-500">/* Jumlah elemen (yang benar-benar terisi) */</span><br/>
          <span className="text-blue-400">Py_ssize_t</span> ob_size = <span className="text-emerald-400">{node.value.size}</span>;<br/><br/>
          <span className="text-slate-500">/* Kapasitas total yang disewa */</span><br/>
          <span className="text-blue-400">Py_ssize_t</span> allocated = <span className="text-yellow-400">{node.value.capacity}</span>;<br/><br/>
          <span className="text-slate-500">/* Pointer ke Raw C Array di Contiguous Space */</span><br/>
          <span className="text-blue-400">PyObject</span> **ob_item = <span className="text-yellow-300">&amp;array[{node.value.startIndex}]</span>;
        </>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-emerald-400 font-mono text-xs mb-2">// Representasi C-Struct internal di memori CPython</p>
        <div className="bg-[#050608] p-4 rounded border border-slate-700 font-mono text-xs leading-relaxed">
          <span className="text-purple-400">typedef struct</span> &#123;<br/>
          <div className="pl-4 border-l-2 border-slate-800 ml-2 my-2 space-y-1">
            <span className="text-slate-300">PyObject_HEAD</span><br/><br/>
            <span className="text-blue-400">Py_ssize_t</span> ob_refcnt = <span className={node.refcnt > 0 ? "text-blue-400" : "text-rose-400"}>{node.refcnt}</span>;<br/><br/>
            <span className="text-blue-400">struct _typeobject</span> *ob_type = <span className="text-slate-300">&amp;Py{node.type.charAt(0).toUpperCase() + node.type.slice(1)}_Type</span>;<br/><br/>
            {extraFields}
          </div>
          &#125; <span className="text-yellow-300">{structName}</span>;
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0B0D12] border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#161B22] border-b border-slate-700 p-3 flex justify-between items-center">
          <h3 className="font-mono text-sm font-bold text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">🔍 Inspector |</span> 
            <span className="text-yellow-400">{node.address || `Pointer_Block[${node.index}]`}</span>
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 text-sm">{renderStructContent()}</div>
      </div>
    </div>
  );
};

export default function PythonLowLevelGame() {
  const [step, setStep] = useState(1);
  const totalSteps = 6; // DITAMBAH JADI 6

  const { 
    heap, pointerSpace, variables, logs, 
    createPyObject, assignVariable, createList, appendToList, popFromList, initPythonEngine 
  } = usePythonMemoryStore();

  const [varName, setVarName] = useState("x");
  const [varValue, setVarValue] = useState("100");
  const [listName, setListName] = useState("my_list");
  const [listValues, setListValues] = useState("10, Halo");
  const [appendValue, setAppendValue] = useState("99");
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => { initPythonEngine(); }, [initPythonEngine]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleCreateVar = () => {
    if (!varName || !varValue) return;
    const isNumber = !isNaN(Number(varValue));
    const address = createPyObject(isNumber ? 'int' : 'str', isNumber ? Number(varValue) : varValue);
    if (address) assignVariable(varName, address);
  };

  const handleCreateList = () => {
    if (!listName || !listValues) return;
    const items = listValues.split(',').map(item => {
      const trimmed = item.trim();
      return !isNaN(Number(trimmed)) ? Number(trimmed) : trimmed;
    });
    createList(listName, items);
  };

  const handleAppend = () => {
    if (!appendValue) return;
    const isNumber = !isNaN(Number(appendValue));
    appendToList(listName, isNumber ? Number(appendValue) : appendValue);
  };

  const handlePop = () => {
    popFromList(listName);
  };

  return (
    <main className="min-h-screen bg-[#0E1117] text-slate-300 flex flex-col font-mono text-sm selection:bg-blue-900 selection:text-blue-100">
      {selectedNode && <MemoryInspectorModal node={selectedNode} onClose={() => setSelectedNode(null)} />}

      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0B0D12] z-20">
        <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">← Kembali</Link>
        <div className="font-semibold text-slate-300 tracking-wide">
          CPython Memory Layout <span className="text-slate-600 mx-2">|</span> Step {step} of {totalSteps}
        </div>
        <button onClick={() => { initPythonEngine(); setStep(1); }} className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded border border-slate-700 hover:border-slate-500 transition-all">
          Reset Engine
        </button>
      </header>

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* ================= PANEL KIRI ================= */}
        <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-[#0B0D12] z-10 shadow-2xl">
          <div className="p-8 flex-grow overflow-y-auto space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6 border-b border-slate-800 pb-4 tracking-tight">
              {step === 1 && "1. Anatomi PyObject"}
              {step === 2 && "2. Reference Counting"}
              {step === 3 && "3. The PyListObject"}
              {step === 4 && "4. Dynamic Array Append"}
              {step === 5 && "5. O(N) Array Reallocation"}
              {step === 6 && "6. The Pop Delusion"}
            </h2>

            {/* STEP 1 - 4 (SAMA SEPERTI SEBELUMNYA) */}
            {step === 1 && (
              <div className="space-y-6 text-slate-400 leading-relaxed text-[13px]">
                <p>Segala hal di Python adalah objek.</p>
                <div className="flex gap-2 items-center bg-[#161B22] p-2 rounded border border-slate-800">
                  <input type="text" value={varName} onChange={e => setVarName(e.target.value)} className="w-10 bg-transparent text-blue-400 text-center outline-none" placeholder="x" />
                  <span className="text-slate-500">=</span>
                  <input type="text" value={varValue} onChange={e => setVarValue(e.target.value)} className="flex-1 bg-transparent text-emerald-400 outline-none px-2" placeholder="100" />
                  <button onClick={handleCreateVar} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold">Execute</button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6 text-slate-400 leading-relaxed text-[13px]">
                <p>Ubah nilai variabel <code>{varName}</code> di bawah. Python akan memindahkan pointer variabel ke alamat baru.</p>
                <div className="flex gap-2 items-center bg-[#161B22] p-2 rounded border border-slate-800">
                  <span className="w-10 text-center text-blue-400">{varName}</span><span className="text-slate-500">=</span>
                  <input type="text" value={varValue} onChange={e => setVarValue(e.target.value)} className="flex-1 bg-transparent text-emerald-400 outline-none px-2" placeholder="Nilai baru" />
                  <button onClick={handleCreateVar} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold">Re-assign</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-slate-400 leading-relaxed text-[13px]">
                <p>Saat membuat List, Python memproduksi objek <code>list</code> sebagai mandor, dan menyewa lahan di Pointer Space.</p>
                <div className="flex flex-col gap-2 bg-[#161B22] p-3 rounded border border-slate-800">
                  <div className="flex items-center gap-2"><span className="text-blue-400">{listName}</span> <span className="text-slate-500">= [</span></div>
                  <input type="text" value={listValues} onChange={e => setListValues(e.target.value)} className="w-full bg-transparent text-emerald-400 outline-none py-1" />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                    <span className="text-slate-500">]</span>
                    <button onClick={handleCreateList} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold">Allocate List</button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-slate-400 leading-relaxed text-[13px]">
                <p>Selama masih ada slot kosong (<code>NULL</code>), fungsi <code>append()</code> berjalan instan ($O(1)$).</p>
                <div className="flex items-center gap-2 bg-[#161B22] p-3 rounded border border-slate-800">
                  <span className="text-blue-400">{listName}</span><span className="text-slate-500">.append(</span>
                  <input type="text" value={appendValue} onChange={e => setAppendValue(e.target.value)} className="w-16 bg-transparent text-emerald-400 text-center outline-none border-b border-slate-700 focus:border-emerald-500" placeholder="99" />
                  <span className="text-slate-500">)</span>
                  <div className="flex-1 flex justify-end">
                    <button onClick={handleAppend} className="px-4 py-1.5 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 rounded text-xs font-semibold">Append</button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 BARU */}
            {step === 5 && (
              <div className="space-y-4 text-slate-400 leading-relaxed text-[13px]">
                <p><strong>Coba terus tekan Append!</strong> Saat nilai <code>ob_size</code> menyamai <code>allocated</code>, List akan kehabisan kapasitas.</p>
                <p>Python terpaksa mencari lahan baru yang lebih luas, lalu memindahkan semua data lama satu per satu ($O(N)$). Proses ini lambat, tapi inilah rahasia kenapa List bisa melar.</p>
                
                <div className="p-3 bg-yellow-950/20 border border-yellow-900/50 rounded text-yellow-300/80 italic text-xs mb-2">
                  Perhatikan Pointer Space di kanan. Blok lama akan "dihancurkan" dan berpindah ke deretan indeks baru!
                </div>

                <div className="flex items-center gap-2 bg-[#161B22] p-3 rounded border border-slate-800">
                  <span className="text-blue-400">{listName}</span><span className="text-slate-500">.append(</span>
                  <input type="text" value={appendValue} onChange={e => setAppendValue(e.target.value)} className="w-16 bg-transparent text-emerald-400 text-center outline-none border-b border-slate-700" />
                  <span className="text-slate-500">)</span>
                  <div className="flex-1 flex justify-end">
                    <button onClick={handleAppend} className="px-4 py-1.5 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500 border border-yellow-900/50 rounded text-xs font-bold transition-all hover:scale-105">Force Append</button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 BARU */}
            {step === 6 && (
              <div className="space-y-4 text-slate-400 leading-relaxed text-[13px]">
                <p>Bagaimana kalau data dihapus menggunakan <code>pop()</code>?</p>
                <p>Nilai <code>ob_size</code> di PyListObject akan mengecil, dan pointer di array akan diputus menjadi <code>NULL</code>.</p>
                <p className="text-rose-400"><strong>TAPI LIHAT:</strong> Nilai <code>allocated</code> dan kotak memori di Pointer Space <strong>TIDAK</strong> dikembalikan ke OS!</p>
                <p>Python menahan memori tersebut untuk berjaga-jaga jika kamu melakukan <code>append</code> lagi nanti.</p>

                <div className="flex items-center justify-between bg-[#161B22] p-3 rounded border border-slate-800 mt-4">
                  <div>
                    <span className="text-blue-400">{listName}</span><span className="text-slate-500">.pop()</span>
                  </div>
                  <button onClick={handlePop} className="px-4 py-1.5 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 rounded text-xs font-semibold">Execute Pop</button>
                </div>
              </div>
            )}

          </div>

          <div className="flex gap-1 p-4 bg-[#0B0D12] border-t border-slate-800/50">
            <button onClick={prevStep} disabled={step === 1} className="flex-1 py-2 bg-[#161B22] hover:bg-slate-800 disabled:opacity-30 rounded text-slate-400 font-medium text-xs transition-colors">Back</button>
            <button onClick={nextStep} disabled={step === totalSteps} className="flex-1 py-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/30 disabled:opacity-30 rounded font-medium text-xs transition-colors">Continue</button>
          </div>
          
          <div className="h-40 bg-[#050608] border-t border-slate-800 p-4 overflow-y-auto font-mono text-[10px] flex flex-col-reverse text-slate-500">
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className={`opacity-80 ${log.includes('⚡') ? 'text-yellow-400' : log.includes('🚨') || log.includes('⚠️') ? 'text-rose-400 font-bold' : log.includes('🗑️') ? 'text-purple-400' : ''}`}>
                  <span className="text-slate-700">[{new Date().toLocaleTimeString('en-US', {hour12: false})}]</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= PANEL KANAN: VISUALIZER ================= */}
        <div className="w-full md:w-7/12 flex flex-col bg-[#0E1117] overflow-y-auto p-8 gap-10">
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* STACK VARIABLES */}
            <div className="w-full xl:w-1/4">
              <h3 className="font-semibold text-slate-500 mb-4 text-xs tracking-wider">NAMESPACE</h3>
              <div className="space-y-2">
                {Object.entries(variables).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-[#161B22] px-4 py-2.5 rounded border border-slate-800">
                    <span className="text-blue-400 font-medium">{key}</span>
                    <span className="text-slate-600 text-xs">→</span>
                    <span className="text-slate-300 text-[10px] font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HEAP MEMORY */}
            <div className="w-full xl:w-3/4">
              <h3 className="font-semibold text-slate-500 mb-4 text-xs tracking-wider">HEAP (PYOBJECTS)</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {heap.slice(0, 9).map((obj, i) => (
                  <div 
                    key={i} 
                    onClick={() => !obj.isFree && setSelectedNode(obj)}
                    className={`p-3 rounded border text-xs transition-all duration-300 
                      ${obj.isFree ? 'bg-[#0B0D12] border-slate-800/50' : 
                        obj.refcnt === 0 ? 'bg-rose-950/20 border-rose-900/50 opacity-40' : 
                        obj.type === 'list' ? 'bg-blue-950/10 border-blue-900/30 ring-1 ring-blue-900/50 cursor-pointer hover:bg-blue-900/20' : 
                        'bg-[#161B22] border-slate-700 cursor-pointer hover:bg-slate-800'}`}
                  >
                    <div className="text-[10px] text-slate-500 mb-2 font-mono">{obj.address}</div>
                    {obj.isFree ? (
                      <div className="h-14 flex items-center justify-center text-slate-700 italic opacity-40">unallocated</div>
                    ) : (
                      <div className="space-y-1.5 font-mono">
                        <div className="flex justify-between border-b border-slate-800 pb-1">
                          <span className="text-slate-500">ob_type</span>
                          <span className={obj.type === 'list' ? 'text-blue-400 font-bold' : 'text-slate-300'}>{obj.type}</span>
                        </div>
                        {obj.type === 'list' ? (
                          <div className="bg-[#0B0D12] p-1.5 rounded border border-slate-800 space-y-1 my-1">
                            <div className="flex justify-between"><span className="text-slate-500">ob_size</span><span className="text-emerald-400">{obj.value.size}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">allocated</span><span className="text-yellow-400">{obj.value.capacity}</span></div>
                          </div>
                        ) : (
                          <div className="flex justify-between pt-0.5"><span className="text-slate-500">ob_value</span><span className="text-emerald-400 truncate max-w-[60px]">{String(obj.value)}</span></div>
                        )}
                        <div className="flex justify-between border-t border-slate-800 pt-1.5">
                          <span className="text-slate-500">ob_refcnt</span>
                          <span className={obj.refcnt > 0 ? 'text-blue-400' : 'text-rose-400'}>{obj.refcnt}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* POINTER SPACE - DITAMPILKAN 24 KOTAK BIAR KELIHATAN PINDAHNYA */}
          <div className={`transition-all duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
            <h3 className="font-semibold text-slate-500 mb-4 text-xs tracking-wider">CONTIGUOUS POINTER SPACE (RAW C ARRAY)</h3>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5 p-4 bg-[#0B0D12] rounded border border-slate-800">
              {pointerSpace.slice(0, 24).map((block, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedNode({ isPointerBlock: true, ...block })}
                  className={`h-12 flex flex-col items-center justify-center border text-[10px] rounded transition-all duration-500 font-mono cursor-pointer
                    ${block.isAllocated ? block.targetAddress ? 'bg-[#161B22] border-emerald-800/50 hover:border-emerald-500' : 'bg-slate-900 border-slate-600 border-dashed hover:border-slate-400' : 'bg-[#0B0D12] border-slate-800 text-slate-600'}`}
                >
                  <span className="text-slate-600 mb-0.5 text-[8px]">{block.index}</span>
                  {block.isAllocated ? (
                    <span className={block.targetAddress ? 'text-emerald-300' : 'text-slate-500 italic'}>
                      {block.targetAddress ? "PTR" : "NULL"}
                    </span>
                  ) : (
                    <span className="opacity-30">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}