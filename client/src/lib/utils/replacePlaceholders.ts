export const replacePlaceholders = (template: string, data: { [key: string]: string }) => {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "________");
};
