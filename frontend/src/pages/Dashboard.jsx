import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearToken, getUser } from "../lib/auth";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Select from "../components/Select";
import Toast from "../components/Toast";
import Panel from "../components/Panel";
import { CalendarCheck2, LogOut, Shield, Sparkles, FileText, CheckCircle2, XCircle } from "lucide-react";

function Stat({ label, value }){
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/25 shadow-softin px-4 py-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

export default function Dashboard(){
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const notify = (title, message="") => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchAll = async () => {
    try{
      setLoading(true);
      const [a, l, r] = await Promise.all([
        api.get("/attendance"),
        api.get("/leaves"),
        isAdmin ? api.get("/reports/summary") : Promise.resolve({ data: { report: "" } })
      ]);

      setAttendance(a.data);
      setLeaves(l.data);
      setReport(r.data.report || "");
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const logout = async () => {
    try{ await api.post("/auth/logout", {}); }catch{}
    clearToken();
    window.location.href = "/login";
  };

  // student log attendance
  const logAttendance = async () => {
    try{
      await api.post("/attendance/log", {});
      notify("Logged", "Attendance logged. AI summary generated.");
      fetchAll();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  // leave request
  const [leave, setLeave] = useState({ fromDate:"", toDate:"", reason:"" });

  const submitLeave = async (e) => {
    e.preventDefault();
    try{
      const res = await api.post("/leaves", leave);
      notify("Submitted", "Leave request submitted with AI leave message.");
      setLeave({ fromDate:"", toDate:"", reason:"" });
      fetchAll();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  // admin approve/reject
  const updateLeaveStatus = async (id, status) => {
    try{
      await api.put(`/leaves/${id}/status`, { status });
      notify("Updated", "Leave status updated.");
      fetchAll();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  const stats = useMemo(() => {
    const totalDays = attendance.length;
    const present = attendance.filter(x=>x.status==="present").length;
    const percent = totalDays ? Math.round((present/totalDays)*100) : 0;
    const approved = leaves.filter(x=>x.status==="approved").length;
    const rejected = leaves.filter(x=>x.status==="rejected").length;
    return { totalDays, present, percent, approved, rejected };
  }, [attendance, leaves]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Panel className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-200">
                <Sparkles size={16} />
                Smart Attendance & Leave
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
                Attendance Dashboard
              </h1>
              <p className="text-slate-300 mt-2">
                Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!isAdmin ? <Button onClick={logAttendance}><CalendarCheck2 size={18}/> Log Attendance</Button> : null}
              <Button variant="secondary" onClick={logout}><LogOut size={18}/> Logout</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Total Days" value={stats.totalDays} />
            <Stat label="Present Days" value={stats.present} />
            <Stat label="Attendance %" value={stats.percent+"%"} />
            <Stat label="Leaves Approved" value={stats.approved} />
            <Stat label="Leaves Rejected" value={stats.rejected} />
          </div>
        </Panel>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Student leave request */}
          {!isAdmin ? (
            <Panel className="p-6">
              <h2 className="text-xl font-extrabold inline-flex items-center gap-2"><FileText size={18}/> Submit Leave</h2>
              <form onSubmit={submitLeave} className="mt-5 grid gap-4">
                <Input label="From Date" type="date" required value={leave.fromDate} onChange={(e)=>setLeave(x=>({...x,fromDate:e.target.value}))} />
                <Input label="To Date" type="date" required value={leave.toDate} onChange={(e)=>setLeave(x=>({...x,toDate:e.target.value}))} />
                <Textarea label="Reason" required value={leave.reason} onChange={(e)=>setLeave(x=>({...x,reason:e.target.value}))} placeholder="Explain reason..." />
                <Button type="submit">Submit Request</Button>
              </form>
            </Panel>
          ) : (
            <Panel className="p-6">
              <h2 className="text-xl font-extrabold inline-flex items-center gap-2"><Shield size={18}/> Admin Summary Report (AI)</h2>
              <p className="text-slate-300 text-sm mt-2">Auto-generated by Groq whenever attendance or leave changes.</p>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/30 shadow-softin p-4 text-sm text-slate-200 whitespace-pre-wrap">
                {report || "No report available."}
              </div>
            </Panel>
          )}

          {/* Attendance list */}
          <Panel className="p-6 lg:col-span-2">
            <h2 className="text-xl font-extrabold">Attendance Logs</h2>
            <div className="mt-4 grid gap-3">
              {loading ? <div className="text-slate-300">Loading…</div> : null}
              {attendance.length === 0 ? <div className="text-slate-400">No attendance logs.</div> : null}
              {attendance.slice(0, 15).map(a => (
                <div key={a._id} className="rounded-[22px] border border-white/10 bg-slate-950/30 shadow-softin px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{new Date(a.date).toDateString()}</div>
                    <div className="text-xs text-slate-400">Student: {a.student?.name}</div>
                  </div>
                  <div className="text-sm font-semibold text-emerald-200">{a.status}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Leaves */}
        <Panel className="p-6 mt-6">
          <h2 className="text-xl font-extrabold">Leave Requests</h2>
          <div className="mt-4 grid gap-3">
            {leaves.length === 0 ? <div className="text-slate-400">No leave requests.</div> : null}
            {leaves.map(l => (
              <div key={l._id} className="rounded-[22px] border border-white/10 bg-slate-950/30 shadow-softin p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-bold">{l.student?.name} • {l.student?.email}</div>
                    <div className="text-sm text-slate-300 mt-1">
                      {l.fromDate} → {l.toDate}
                    </div>
                    <div className="text-sm text-slate-200 mt-2 whitespace-pre-wrap">{l.reason}</div>
                    {l.aiLeaveMessage ? (
                      <div className="text-xs text-slate-300 mt-3 border border-white/10 rounded-[18px] bg-white/5 p-3 whitespace-pre-wrap">
                        <b>AI Leave Message:</b>{"\n"}{l.aiLeaveMessage}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-sm">
                    <div className="font-semibold">
                      Status: <span className={l.status==="pending" ? "text-amber-200" : l.status==="approved" ? "text-emerald-200" : "text-rose-200"}>{l.status}</span>
                    </div>

                    {isAdmin && l.status === "pending" ? (
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => updateLeaveStatus(l._id, "approved")} className="px-4 py-2 rounded-[20px] bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-100 font-semibold inline-flex items-center gap-2">
                          <CheckCircle2 size={16}/> Approve
                        </button>
                        <button onClick={() => updateLeaveStatus(l._id, "rejected")} className="px-4 py-2 rounded-[20px] bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-100 font-semibold inline-flex items-center gap-2">
                          <XCircle size={16}/> Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="text-center text-xs text-slate-500 mt-10">
          Neumorphism UI • Groq AI Reports • Secure RBAC
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
