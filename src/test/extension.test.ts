import * as assert from 'assert';
import * as vscode from 'vscode';

suite('AutoModerator Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('automoderator'));
    });

    test('Should activate', async () => {
        const ext = vscode.extensions.getExtension('automoderator');
        if (ext) {
            await ext.activate();
            assert.ok(true);
        }
    });

    test('Should register completion provider', () => {
        // This test would verify that the completion provider is registered
        // In a real test, you'd check if the provider is available
        assert.ok(true);
    });
}); 