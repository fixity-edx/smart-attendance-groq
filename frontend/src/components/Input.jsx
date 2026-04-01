import React from "react";

export default function Input({ label, ...props }){
  return (
    <label className="block">
      {label ? <div className="text-sm text-slate-300 mb-1">{label}</div> : null}
      <input
        {...props}
        className={"w-full rounded-[22px] border border-white/10 bg-slate-950/30 px-4 py-2.5 outline-none shadow-softin focus:ring-2 focus:ring-blue-500/60 "+(props.className||"")}
      />
    </label>
  );
}
