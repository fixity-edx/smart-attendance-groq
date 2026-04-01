import React from "react";

export default function Panel({ className="", children }){
  return (
    <div className={"rounded-panel border border-white/10 bg-slate-950/25 backdrop-blur-xl shadow-soft "+className}>
      {children}
    </div>
  );
}
