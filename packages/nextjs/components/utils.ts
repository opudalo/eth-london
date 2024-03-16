import numbro from "numbro";


export const formatInputValue = {
  thousandSeparated: true,
  // average: true,
  optionalMantissa: true,
  trimMantissa: true,
  mantissa: 3,
};

export const formatNum = (x: number) => (x ? numbro(x).format(formatInputValue) : x.toString());

export const sec = 1000
export const min = 60 * sec;
export const hour = 60 * min;
export const day = 24 * hour;


export const times = {
  "15 secondons": 15 * sec,
  "30 seconds": 30 * sec,
  "minute": min,
  "5 minutes": 5 * min,
  "15 minutes": 15 * min,
  "30 minutes": 30 * min,
  "hour": hour,
  "4 hours": 4 * hour,
  "12 hours": 12 * hour,
  "day": day,
  "week": 7 * day,
};
