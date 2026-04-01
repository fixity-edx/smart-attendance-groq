import ReportCache from "../models/ReportCache.js";

export async function getSummary(req, res, next){
  try{
    const cache = await ReportCache.findOne({ key: "global" });
    res.json({ report: cache?.report || "" });
  }catch(err){ next(err); }
}
