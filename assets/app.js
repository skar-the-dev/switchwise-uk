(() => {
  "use strict";
  const gbp = value => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
  const value = id => Number(document.getElementById(id).value);
  const finiteValues = ids => ids.every(id => Number.isFinite(value(id)) && value(id) >= 0);
  const show = (id, heading, detail) => {
    const node = document.getElementById(id);
    node.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = heading;
    const text = document.createElement("span");
    text.textContent = detail;
    node.append(strong, text);
  };
  const bind = (id, handler) => {
    const form = document.getElementById(id);
    const resultIds = {"savings-form":"savings-result","energy-form":"energy-result","broadband-form":"broadband-result","mobile-form":"mobile-result","goal-form":"goal-result"};
    if (form) form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) {
        show(resultIds[id], "Complete the required fields", "Enter a value in each field before calculating. Use 0 for any cost or fuel that does not apply.");
        return;
      }
      handler();
    });
  };

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  bind("savings-form", () => {
    const ids = ["current-bill", "new-bill"];
    if (!finiteValues(ids)) return;
    const current = value(ids[0]);
    const next = value(ids[1]);
    const monthly = current - next;
    const annual = monthly * 12;
    if (monthly > 0) {
      show("savings-result", gbp(annual) + " potential annual saving", gbp(monthly) + " less per month before fees, price changes or changes in usage.");
    } else if (monthly === 0) {
      show("savings-result", "No price difference", "The two monthly amounts are the same.");
    } else {
      show("savings-result", gbp(Math.abs(annual)) + " more per year", "The new quote is " + gbp(Math.abs(monthly)) + " more each month.");
    }
    const hero = document.getElementById("hero-savings");
    if (hero) hero.textContent = Math.max(0, annual).toLocaleString("en-GB", { maximumFractionDigits: 0 });
  });

  bind("energy-form", () => {
    const ids = ["electric-kwh", "electric-rate", "electric-standing", "gas-kwh", "gas-rate", "gas-standing"];
    if (!finiteValues(ids)) return;
    const electricUnit = value("electric-kwh") * value("electric-rate") / 100;
    const electricStanding = value("electric-standing") * 365;
    const gasUnit = value("gas-kwh") * value("gas-rate") / 100;
    const gasStanding = value("gas-standing") * 365;
    const total = electricUnit + electricStanding + gasUnit + gasStanding;
    show("energy-result", gbp(total) + " estimated annual energy cost",
      "Electricity: " + gbp(electricUnit + electricStanding) + " · Gas: " + gbp(gasUnit + gasStanding) + ". Uses 365 days and your entered rates; excludes discounts and usage changes.");
  });

  bind("broadband-form", () => {
    const ids = ["bb-price", "bb-months", "bb-setup", "bb-credit"];
    if (!finiteValues(ids) || value("bb-months") < 1) return;
    const months = value("bb-months");
    const total = value("bb-price") * months + value("bb-setup") - value("bb-credit");
    const effective = total / months;
    show("broadband-result", gbp(total) + " estimated contract cost",
      "Effective average: " + gbp(effective) + " per month across " + months + " months, after entered fees and credits. Check any mid-contract price rises.");
  });

  bind("mobile-form", () => {
    const ids = ["mobile-price", "mobile-months", "mobile-upfront", "mobile-fees"];
    if (!finiteValues(ids) || value("mobile-months") < 1) return;
    const months = value("mobile-months");
    const total = value("mobile-price") * months + value("mobile-upfront") + value("mobile-fees");
    show("mobile-result", gbp(total) + " estimated contract cost",
      "Average: " + gbp(total / months) + " per month over " + months + " months, including the upfront and one-off fees entered. Excludes add-ons and future price changes.");
  });

  bind("goal-form", () => {
    const ids = ["goal-target", "goal-current", "goal-monthly"];
    if (!finiteValues(ids) || value("goal-target") <= 0 || value("goal-monthly") <= 0) return;
    const target = value("goal-target");
    const current = value("goal-current");
    const monthly = value("goal-monthly");
    const remaining = Math.max(0, target - current);
    if (remaining === 0) {
      show("goal-result", "Target reached", "You have already saved " + gbp(current) + ".");
      return;
    }
    const months = Math.ceil(remaining / monthly);
    show("goal-result", months + " month" + (months === 1 ? "" : "s") + " to reach your target",
      "Save " + gbp(monthly) + " each month to build the remaining " + gbp(remaining) + ". Interest is not included.");
  });
})();