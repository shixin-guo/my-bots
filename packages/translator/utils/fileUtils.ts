export function getFileNameAndType(filename: string): {
  name: string;
  type: string;
} {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex == -1) {
    return { name: filename, type: '' };
  }
  const pathSeparatorIndex = Math.max(
    filename.lastIndexOf('/'),
    filename.lastIndexOf('\\'),
  );
  const startIndex = pathSeparatorIndex > -1 ? pathSeparatorIndex + 1 : 0;
  const name = filename.slice(startIndex, dotIndex);
  const type = filename.slice(dotIndex + 1);
  return { name, type };
}
