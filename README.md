# 🌸 Tabi no Tomodachi · Viagem Japão 2026

Site mobile-first para acompanhar a viagem do Adalberto e Vinicius ao Japão (23/05 a 04/06/2026).  
Compartilhado em tempo real com a família no Brasil via Firebase.

## 🔐 Senhas

| Acesso | Senha | O quê |
|--------|-------|-------|
| Geral (família) | **2004** | Roteiro, hotéis, voos, contatos. Pode editar/adicionar/excluir compromissos. |
| Financeiro | **4302** | Painel de gastos (só para o Adalberto). |

---

## 📦 Arquivos do projeto

```
viagem-japao-2026/
├── index.html          ← App principal
├── style.css           ← Estilo sakura/Japão
├── app.js              ← Lógica + Firebase
├── seed.html           ← Popular banco (rodar 1 vez)
├── firestore.rules     ← Regras de segurança
├── firebase.json       ← Config do deploy
└── README.md           ← Este arquivo
```

---

## 🚀 PASSO A PASSO DO DEPLOY

### **Passo 1: Aplicar as regras de segurança do Firestore** (FAZER PRIMEIRO!)

1. Vai em https://console.firebase.google.com → projeto `viagem-japao-2026`
2. Menu lateral → **Firestore Database** → aba **Rules**
3. **Apague todo o conteúdo** e cole o conteúdo do arquivo `firestore.rules`
4. Clique em **Publish**

> ⚠️ Importante: As regras padrão "test mode" expiram em 30 dias. Aplique as regras corretas agora para não ter problema durante a viagem.

---

### **Passo 2: Popular o banco com os eventos iniciais**

Você tem **duas opções**:

**Opção A — Mais simples (recomendado):**
1. Abra o arquivo `seed.html` diretamente no navegador (clica 2x no arquivo)
2. Clica em **🌱 Popular banco agora**
3. Espera ~10s — vai aparecer "✅ SUCESSO!"
4. Pronto! O banco tem todos os eventos.

**Opção B — Após deploy:**
1. Suba todos os arquivos pro Firebase Hosting (Passo 3)
2. Acesse `https://viagem-japao-2026.web.app/seed.html`
3. Clica em popular
4. **Depois delete o arquivo `seed.html` por segurança** (faça novo deploy sem ele)

---

### **Passo 3: Deploy no Firebase Hosting**

#### Pré-requisitos
- Node.js instalado (https://nodejs.org)
- Conta Google logada no Firebase (a mesma do projeto)

#### Instalar Firebase CLI (uma vez só)
```bash
npm install -g firebase-tools
```

#### No terminal, na pasta do projeto:
```bash
cd caminho/para/viagem-japao-2026

# Login (abre navegador)
firebase login

# Inicializar (escolher as opções abaixo)
firebase init hosting
```

Quando perguntar:
- **Project**: Use an existing project → `viagem-japao-2026`
- **Public directory**: `.` (ponto — diretório atual!)
- **Single-page app?**: `No`
- **Set up automatic builds with GitHub?**: `No`
- **Overwrite index.html?**: **`No`** (NÃO sobrescrever!)

Isso vai criar:
- `firebase.json`
- `.firebaserc`

#### Deploy:
```bash
firebase deploy --only hosting
```

✅ Site online em `https://viagem-japao-2026.web.app` em ~1 minuto!

---

### **Passo 4: Alternativa — Deploy no GitHub Pages**

Se preferir GitHub Pages:

```bash
# Criar repositório (no GitHub: New Repository → "viagem-japao-2026")
# Depois no terminal:
cd caminho/para/viagem-japao-2026
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEUUSER/viagem-japao-2026.git
git push -u origin main
```

No GitHub:
1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `main` → `/` (root)
4. Save

Site em `https://SEUUSER.github.io/viagem-japao-2026/` em ~2 min.

---

## 🔄 Atualizar o site depois

### Firebase Hosting:
```bash
firebase deploy --only hosting
```

### GitHub Pages:
```bash
git add .
git commit -m "Update"
git push
```

---

## 📲 Compartilhar com a família

Mande para o WhatsApp dos familiares:

> 🌸 Acompanhe nossa viagem ao Japão!
> 
> 🔗 https://viagem-japao-2026.web.app
> 🔐 Senha: 2004

Se quiserem que o site abra como app no celular:
- **iPhone**: Safari → Compartilhar → "Adicionar à Tela de Início"
- **Android**: Chrome → ⋮ → "Adicionar à tela inicial"

---

## ⚠️ Cuidados importantes

1. **Não compartilhe a senha 4302** com ninguém além de você.
2. **Faça backup do banco** antes da viagem (Firebase Console → Firestore → Export).
3. **Teste tudo antes** de viajar — adicionar um evento, editar, excluir, abrir financeiro.
4. Se algo der errado **durante a viagem**, o roteiro completo ainda está nos PDFs originais.

---

## 🐛 Resolução de problemas

| Problema | Solução |
|----------|---------|
| Site não carrega dados | Verifique se aplicou as regras do Firestore (Passo 1) |
| Erro "permission-denied" | Regras estão muito restritivas — revisar `firestore.rules` |
| Eventos duplicados após seed | Use o botão "Limpar tudo" no `seed.html` e rode de novo |
| Família não consegue editar | Confirme que estão usando a senha 2004 (não 4302) |
| Senha esquecida no celular | Sair e entrar novamente (botão ↩ no header) |

---

## 🎌 Boa viagem!

Made with 🌸 by Tabi no Tomodachi
