// Filter semantics shared by the catalog page (fw.js) and its test (tests/test_facet_logic.py).
// Within one facet a row matches when it has ANY ticked value, except Apps and Language, which are
// "must match every value" (the same rule as the API's apps= and language= parameters).
// A count next to a value is how many rows you would get if you ticked that value too.
(function (root) {
  var AND = { app: 1, lang: 1 };
  function passes(fv, f, skip) {
    for (var k in f) {
      if (k === skip || !f[k].length) continue;
      var vals = (fv && fv[k]) || [];
      var ok = AND[k] ? f[k].every(function (v) { return vals.indexOf(v) >= 0; }) : f[k].some(function (v) { return vals.indexOf(v) >= 0; });
      if (!ok) return false;
    }
    return true;
  }
  // rows: entries with .fv; f: {facet: [ticked values]}; pre: filter that is not a facet (search, scope).
  function counts(rows, f, k, pre) {
    var out = {};
    rows.forEach(function (r) {
      if (pre && !pre(r)) return;
      // OR facet: its own ticks are ignored (ticking another value adds rows). AND facet: they stay (ticking another value removes rows).
      if (!passes(r.fv, f, AND[k] ? null : k)) return;
      ((r.fv && r.fv[k]) || []).forEach(function (v) { out[v] = (out[v] || 0) + 1; });
    });
    return out;
  }
  var api = { AND: AND, passes: passes, counts: counts };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FWFacet = api;
})(typeof window !== 'undefined' ? window : this);
