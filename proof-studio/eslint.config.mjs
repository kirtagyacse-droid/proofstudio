import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

function patchPluginRules(plugin) {
  if (!plugin || !plugin.rules) return;
  for (const ruleName of Object.keys(plugin.rules)) {
    const rule = plugin.rules[ruleName];
    const getProxyContext = (context) => {
      return new Proxy(context, {
        get(target, prop) {
          if (prop === 'getFilename') return () => target.filename;
          if (prop === 'getPhysicalFilename') return () => target.physicalFilename;
          if (prop === 'getCwd') return () => target.cwd;
          if (prop === 'getSourceCode') return () => target.sourceCode;
          const value = target[prop];
          if (typeof value === 'function') {
            let current = target;
            let desc;
            while (current && !desc) {
              desc = Object.getOwnPropertyDescriptor(current, prop);
              current = Object.getPrototypeOf(current);
            }
            if (desc && desc.configurable === false) {
              return value;
            }
            return value.bind(target);
          }
          return value;
        }
      });
    };

    if (typeof rule === 'function') {
      const originalRule = rule;
      plugin.rules[ruleName] = function(context) {
        return originalRule.call(this, getProxyContext(context));
      };
    } else if (rule && typeof rule.create === 'function') {
      const originalCreate = rule.create;
      rule.create = function(context) {
        return originalCreate.call(this, getProxyContext(context));
      };
    }
  }
}

function patchConfigs(configs) {
  for (const config of configs) {
    if (config.plugins) {
      for (const pluginName of Object.keys(config.plugins)) {
        patchPluginRules(config.plugins[pluginName]);
      }
    }
  }
  return configs;
}

const configsToDefine = patchConfigs([
  ...nextVitals,
  ...nextTs,
]);

const eslintConfig = defineConfig([
  ...configsToDefine,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "server.js",
    "start.js",
    "test-prisma.js",
  ]),
]);

export default eslintConfig;
