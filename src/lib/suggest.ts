const ROTATE = ["STAA", "KJER", "HELK", "UNDE", "TOPP", "TABM", "NYBE", "FART", "LUFT"];

export function suggestId(input: { trainedToday: boolean; hour: number; dayIndex: number }): string {
  if (!input.trainedToday && input.hour < 10) return "MRGN";
  if (!input.trainedToday) return "KL7";
  return ROTATE[((input.dayIndex % ROTATE.length) + ROTATE.length) % ROTATE.length];
}
