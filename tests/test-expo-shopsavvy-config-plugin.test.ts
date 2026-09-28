// Runs the built config plugin exactly the way `npx expo prebuild` /
// `npx expo config --type introspect` does: a throwaway Expo project whose
// app.json lists "expo-shopsavvy" by package name, resolved through
// node_modules/expo-shopsavvy/app.plugin.js, with every iOS/Android mod
// evaluated in introspection mode (no native files written).
//
// Requires `bun run build` first (the plugin ships from plugin/build/).

import { afterAll, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { getConfig } from '@expo/config'
import { compileModsAsync } from 'expo/config-plugins'

const repo = resolve(import.meta.dir, '..')
const projects: string[] = []

afterAll(async () => {
  const { rm } = await import('fs/promises')
  for (const dir of projects) await rm(dir, { recursive: true, force: true })
})

async function introspect(plugins: unknown[], extraExpo: Record<string, unknown> = {}) {
  const root = mkdtempSync(join(tmpdir(), 'expo-shopsavvy-test-'))
  projects.push(root)
  mkdirSync(join(root, 'node_modules'))
  symlinkSync(repo, join(root, 'node_modules/expo-shopsavvy'))
  symlinkSync(join(repo, 'node_modules/expo'), join(root, 'node_modules/expo'))
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', dependencies: { expo: '*', 'expo-shopsavvy': '*' } }))
  writeFileSync(
    join(root, 'app.json'),
    JSON.stringify({
      expo: {
        name: 'Fixture',
        slug: 'fixture',
        ios: { bundleIdentifier: 'com.example.fixture' },
        android: { package: 'com.example.fixture' },
        plugins,
        ...extraExpo,
      },
    }),
  )
  const { exp } = getConfig(root, { skipSDKVersionRequirement: true, isPublicConfig: false, isModdedConfig: true })
  const out = await compileModsAsync(exp, {
    projectRoot: root,
    introspect: true,
    platforms: ['ios', 'android'],
    assertMissingModProviders: false,
  })
  const permissions: string[] = (
    (out._internal?.modResults?.android?.manifest?.manifest?.['uses-permission'] ?? []) as Array<{ $: Record<string, string> }>
  ).map((p) => p.$['android:name'])
  return { exp, out, infoPlist: (out.ios?.infoPlist ?? {}) as Record<string, unknown>, permissions }
}

describe('expo-shopsavvy config plugin', () => {
  test('the package root exposes app.plugin.js pointing at the built plugin', () => {
    expect(existsSync(join(repo, 'plugin/build/withShopsavvy.js'))).toBe(true)
    const plugin = require(join(repo, 'app.plugin.js'))
    expect(typeof plugin).toBe('function')
  })

  test('injects the API key into extra and wires camera permissions on both platforms', async () => {
    const { exp, infoPlist, permissions } = await introspect([['expo-shopsavvy', { apiKey: 'ss_test_abc123' }]])
    expect(exp.extra?.shopsavvyApiKey).toBe('ss_test_abc123')
    expect(infoPlist.NSCameraUsageDescription).toBe(
      'Allow $(PRODUCT_NAME) to use the camera to scan barcodes for instant price comparison.',
    )
    expect(permissions).toContain('android.permission.CAMERA')
  })

  test('an explicit cameraPermission string wins', async () => {
    const { infoPlist } = await introspect([['expo-shopsavvy', { cameraPermission: 'Scan barcodes to compare prices.' }]], {
      ios: { bundleIdentifier: 'com.example.fixture', infoPlist: { NSCameraUsageDescription: 'Existing text' } },
    })
    expect(infoPlist.NSCameraUsageDescription).toBe('Scan barcodes to compare prices.')
  })

  test('without an explicit string, an existing camera usage description is kept', async () => {
    const { infoPlist } = await introspect(['expo-shopsavvy'], {
      ios: { bundleIdentifier: 'com.example.fixture', infoPlist: { NSCameraUsageDescription: 'Existing text' } },
    })
    expect(infoPlist.NSCameraUsageDescription).toBe('Existing text')
  })

  test('cameraPermission: false leaves camera permissions alone', async () => {
    const { exp, infoPlist, permissions } = await introspect([['expo-shopsavvy', { apiKey: 'ss_test_abc123', cameraPermission: false }]])
    expect(exp.extra?.shopsavvyApiKey).toBe('ss_test_abc123')
    expect(infoPlist.NSCameraUsageDescription).toBeUndefined()
    expect(permissions).not.toContain('android.permission.CAMERA')
  })

  test('no API key in the plugin options means none is written to extra', async () => {
    const { exp } = await introspect(['expo-shopsavvy'])
    expect(exp.extra?.shopsavvyApiKey).toBeUndefined()
  })
})
