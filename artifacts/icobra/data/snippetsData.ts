export interface Snippet {
  prefix: string;
  name: string;
  description: string;
  language: string;
  body: string[];
}

export const kotlinSnippets: Snippet[] = [
  {
    prefix: 'fun',
    name: 'Function',
    description: 'Kotlin function declaration',
    language: 'kotlin',
    body: ['fun ${1:functionName}(${2:params}): ${3:Unit} {', '\t${4:// TODO}', '}'],
  },
  {
    prefix: 'class',
    name: 'Class',
    description: 'Kotlin class declaration',
    language: 'kotlin',
    body: ['class ${1:ClassName}(${2:val param: Type}) {', '\t${3:// TODO}', '}'],
  },
  {
    prefix: 'data',
    name: 'Data Class',
    description: 'Kotlin data class',
    language: 'kotlin',
    body: ['data class ${1:ClassName}(', '\tval ${2:property}: ${3:Type}', ')'],
  },
  {
    prefix: 'object',
    name: 'Object',
    description: 'Kotlin singleton object',
    language: 'kotlin',
    body: ['object ${1:ObjectName} {', '\t${2:// TODO}', '}'],
  },
  {
    prefix: 'sealed',
    name: 'Sealed Class',
    description: 'Kotlin sealed class',
    language: 'kotlin',
    body: ['sealed class ${1:ClassName} {', '\tdata class ${2:Success}(val data: ${3:Any}) : ${1}()', '\tobject ${4:Loading} : ${1}()', '\tdata class ${5:Error}(val message: String) : ${1}()', '}'],
  },
  {
    prefix: 'coroutine',
    name: 'Coroutine Launch',
    description: 'Launch a coroutine',
    language: 'kotlin',
    body: ['viewModelScope.launch {', '\ttry {', '\t\t${1:// TODO}', '\t} catch (e: Exception) {', '\t\tLog.e(TAG, "Error: ${e.message}")', '\t}', '}'],
  },
  {
    prefix: 'flow',
    name: 'StateFlow',
    description: 'MutableStateFlow declaration',
    language: 'kotlin',
    body: ['private val _${1:state} = MutableStateFlow<${2:Type}>(${3:initialValue})', 'val ${1} = _${1}.asStateFlow()'],
  },
  {
    prefix: 'when',
    name: 'When Expression',
    description: 'Kotlin when expression',
    language: 'kotlin',
    body: ['when (${1:value}) {', '\t${2:condition} -> ${3:result}', '\telse -> ${4:default}', '}'],
  },
  {
    prefix: 'shizuku',
    name: 'Shizuku Permission Check',
    description: 'Shizuku permission check boilerplate',
    language: 'kotlin',
    body: [
      'if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {',
      '\t${1:// Permission granted}',
      '} else {',
      '\tShizuku.requestPermission(${2:REQUEST_CODE})',
      '}'
    ],
  },
  {
    prefix: 'viewmodel',
    name: 'ViewModel',
    description: 'ViewModel with StateFlow',
    language: 'kotlin',
    body: [
      'class ${1:Name}ViewModel : ViewModel() {',
      '\tprivate val _uiState = MutableStateFlow<${2:UiState}>(${2:UiState}.Initial)',
      '\tval uiState = _uiState.asStateFlow()',
      '',
      '\tfun ${3:load}() {',
      '\t\tviewModelScope.launch {',
      '\t\t\t${4:// TODO}',
      '\t\t}',
      '\t}',
      '}'
    ],
  },
  {
    prefix: 'logd',
    name: 'Log Debug',
    description: 'Debug log statement',
    language: 'kotlin',
    body: ['Log.d(TAG, "${1:message}")'],
  },
  {
    prefix: 'todo',
    name: 'TODO Comment',
    description: 'TODO comment',
    language: 'kotlin',
    body: ['// TODO: ${1:description}'],
  },
  {
    prefix: 'trycat',
    name: 'Try-Catch',
    description: 'Try-catch block',
    language: 'kotlin',
    body: ['try {', '\t${1:// code}', '} catch (e: ${2:Exception}) {', '\tLog.e(TAG, "Error: ${e.message}")', '}'],
  },
  {
    prefix: 'companion',
    name: 'Companion Object',
    description: 'Companion object with TAG',
    language: 'kotlin',
    body: ['companion object {', '\tprivate const val TAG = "${1:ClassName}"', '}'],
  },
  {
    prefix: 'extension',
    name: 'Extension Function',
    description: 'Kotlin extension function',
    language: 'kotlin',
    body: ['fun ${1:Type}.${2:extensionName}(): ${3:ReturnType} {', '\t${4:// TODO}', '}'],
  },
];

export const xmlSnippets: Snippet[] = [
  {
    prefix: 'tv',
    name: 'TextView',
    description: 'Basic TextView',
    language: 'xml',
    body: [
      '<TextView',
      '\tandroid:id="@+id/${1:textView}"',
      '\tandroid:layout_width="wrap_content"',
      '\tandroid:layout_height="wrap_content"',
      '\tandroid:text="${2:text}" />',
    ],
  },
  {
    prefix: 'btn',
    name: 'Button',
    description: 'Material Button',
    language: 'xml',
    body: [
      '<com.google.android.material.button.MaterialButton',
      '\tandroid:id="@+id/${1:button}"',
      '\tandroid:layout_width="wrap_content"',
      '\tandroid:layout_height="wrap_content"',
      '\tandroid:text="${2:Click Me}" />',
    ],
  },
  {
    prefix: 'rv',
    name: 'RecyclerView',
    description: 'RecyclerView with LinearLayoutManager',
    language: 'xml',
    body: [
      '<androidx.recyclerview.widget.RecyclerView',
      '\tandroid:id="@+id/${1:recyclerView}"',
      '\tandroid:layout_width="match_parent"',
      '\tandroid:layout_height="match_parent"',
      '\tapp:layoutManager="androidx.recyclerview.widget.LinearLayoutManager" />',
    ],
  },
];

export const allSnippets = [...kotlinSnippets, ...xmlSnippets];

export function getSnippetsForLanguage(language: string): Snippet[] {
  return allSnippets.filter(s => s.language === language);
}
