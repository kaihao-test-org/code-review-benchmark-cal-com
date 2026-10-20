export function evaluateRoutingExpression(expression: string, answers: Record<string, string>): boolean {
  const scope = Object.entries(answers)
    .map(([key, value]) => `const ${key} = ${JSON.stringify(value)};`)
    .join("\n");
  return Boolean(eval(`${scope}\n${expression}`));
}

export function summarizeAnswers(answers: Record<string, string>): string {
  return Object.keys(answers).length + " answers";
}
