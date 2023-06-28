import yaml from 'js-yaml';

enum FileType {
  JSON = 'json',
  PROPERTIES = 'properties',
  YAML = 'yaml',
  YML = 'yml',
  TS = 'ts',
  JS = 'js',
}
function json2Properties(json: any): string {
  const ObjectJson = json;
  let result = '';
  for (const key in ObjectJson) {
    if (typeof ObjectJson[key] === 'object') {
      const subKeys = json2Properties(ObjectJson[key]).split('\n');
      subKeys.forEach((subKey) => {
        if (subKey.trim()) {
          result += key + '.' + subKey + '\n';
        }
      });
    } else {
      result += key + '=' + ObjectJson[key] + '\n';
    }
  }
  return result;
}

function properties2Json(properties: string): JSON {
  const result: any = {};
  const lines = properties.split('\n');
  lines.forEach((line) => {
    const parts = line.split('=');
    const keys = parts?.[0]?.split('.').map((key) => key?.trim());
    const value = parts?.[1]?.trim();
    if (!keys || !keys.length || !value) {
      console.log('Invalid line: ' + line);
      return;
    }
    let obj = result;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        try {
          obj[key] = value;
        } catch (e) {
          console.log('line', line, 'Error', e);
        }
      } else {
        if (!obj[key]) {
          obj[key] = {};
        }
        obj = obj[key];
      }
    });
  });
  return result;
}
function yaml2Properties(yamlContent: string) {
  const YamlObject = yaml.load(yamlContent);
  return json2Properties(YamlObject);
}

function properties2YAML(properties: string) {
  const tempJson = properties2Json(properties);
  return yaml.dump(tempJson);
}
// todo how to optimize TS type export
export {
  FileType,
  json2Properties,
  properties2Json,
  yaml2Properties,
  properties2YAML,
};
