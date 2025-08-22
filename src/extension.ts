import * as vscode from 'vscode';
import { AutoModeratorCompletionProvider } from './completionProvider';
import { AutoModeratorHoverProvider } from './hoverProvider';
import { AutoModeratorScaffoldProvider } from './scaffoldProvider';
import { AutoModeratorFormatter } from './formatter';

export function activate(context: vscode.ExtensionContext) {
    console.log('AutoModerator extension is now active!');

    // Register completion provider
    const completionProvider = new AutoModeratorCompletionProvider();
    const completionDisposable = vscode.languages.registerCompletionItemProvider(
        { language: 'automod' },
        completionProvider,
        ':', ' '
    );

    // Register hover provider
    const hoverProvider = new AutoModeratorHoverProvider();
    const hoverDisposable = vscode.languages.registerHoverProvider(
        { language: 'automod' },
        hoverProvider
    );

    // Register scaffold command
    const scaffoldProvider = new AutoModeratorScaffoldProvider();
    const scaffoldDisposable = vscode.commands.registerCommand(
        'automoderator.createScaffold',
        () => scaffoldProvider.createScaffold()
    );

    // Register formatter
    const formatter = new AutoModeratorFormatter();
    const formatterDisposable = vscode.languages.registerDocumentFormattingEditProvider(
        { language: 'automod' },
        formatter
    );

    // Register format command
    const formatCommandDisposable = vscode.commands.registerCommand(
        'automoderator.formatDocument',
        () => vscode.commands.executeCommand('editor.action.formatDocument')
    );

    // Register toggle aggressive IntelliSense command
    const toggleIntelliSenseDisposable = vscode.commands.registerCommand(
        'automoderator.toggleAggressiveIntelliSense',
        async () => {
            const config = vscode.workspace.getConfiguration('automoderator');
            const current = config.get('aggressiveIntelliSense', false);
            await config.update('aggressiveIntelliSense', !current, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Aggressive IntelliSense ${!current ? 'enabled' : 'disabled'}`);
        }
    );



    // Register format on save (disabled by default to prevent conflicts)
    const formatOnSaveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'automod') {
            const config = vscode.workspace.getConfiguration('automoderator');
            if (config.get('formatOnSave', false)) {
                // Add a small delay to prevent conflicts with other formatters
                setTimeout(async () => {
                    try {
                        await vscode.commands.executeCommand('editor.action.formatDocument');
                    } catch (err) {
                        console.error('Format on save error:', err);
                    }
                }, 100);
            }
        }
    });

    // Register document symbol provider for better navigation
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
        { language: 'automod' },
        new AutoModeratorSymbolProvider()
    );

    context.subscriptions.push(
        completionDisposable,
        hoverDisposable,
        scaffoldDisposable,
        formatterDisposable,
        formatCommandDisposable,
        toggleIntelliSenseDisposable,
        formatOnSaveDisposable,
        symbolProvider
    );
}

export function deactivate() {}

class AutoModeratorSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        const symbols: vscode.DocumentSymbol[] = [];
        const lines = document.getText().split('\n');
        
        let currentRule: vscode.DocumentSymbol | undefined;
        let ruleStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for rule separator
            if (line === '---') {
                if (currentRule) {
                    currentRule.range = new vscode.Range(
                        ruleStartLine, 0,
                        i, lines[i].length
                    );
                    symbols.push(currentRule);
                }
                
                // Start new rule
                const nextLine = lines[i + 1]?.trim();
                if (nextLine && nextLine.startsWith('#')) {
                    const comment = nextLine.substring(1).trim();
                    currentRule = new vscode.DocumentSymbol(
                        comment,
                        'AutoModerator Rule',
                        vscode.SymbolKind.Function,
                        new vscode.Range(i, 0, i, 0),
                        new vscode.Range(i, 0, i, 0)
                    );
                } else {
                    currentRule = new vscode.DocumentSymbol(
                        `Rule ${symbols.length + 1}`,
                        'AutoModerator Rule',
                        vscode.SymbolKind.Function,
                        new vscode.Range(i, 0, i, 0),
                        new vscode.Range(i, 0, i, 0)
                    );
                }
                ruleStartLine = i;
            }
        }

        // Add the last rule if exists
        if (currentRule) {
            currentRule.range = new vscode.Range(
                ruleStartLine, 0,
                lines.length - 1, lines[lines.length - 1].length
            );
            symbols.push(currentRule);
        }

        return symbols;
    }
} 