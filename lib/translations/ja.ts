import type { TranslationData } from "./index"

export const ja: TranslationData = {
  // Navigation
  nav: {
    home: "ホーム",
    apply: "申請",
    benefits: "給付",
    help: "ヘルプ",
    language: "言語",
    login: "ログイン",
    logout: "ログアウト",
    profile: "プロフィール",
    dashboard: "ダッシュボード",
  },

  // Common
  common: {
    next: "次へ",
    previous: "前へ",
    save: "保存",
    cancel: "キャンセル",
    submit: "送信",
    edit: "編集",
    delete: "削除",
    confirm: "確認",
    close: "閉じる",
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    warning: "警告",
    info: "情報",
    yes: "はい",
    no: "いいえ",
    optional: "任意",
    required: "必須",
    select: "選択",
    upload: "アップロード",
    download: "ダウンロード",
    print: "印刷",
    search: "検索",
    filter: "フィルター",
    clear: "クリア",
    apply: "適用",
    reset: "リセット",
  },

  // Home Page
  home: {
    title: "MedicaidとSNAP給付申請",
    subtitle: "安全なオンラインプラットフォームで申請プロセスを簡素化",
    getStarted: "開始",
    learnMore: "詳細を見る",
    features: {
      title: "当プラットフォームを選ぶ理由",
      easyApplication: {
        title: "簡単な申請",
        description: "各セクションを案内するステップバイステップのプロセス",
      },
      securePrivate: {
        title: "安全でプライベート",
        description: "個人情報は軍事レベルの暗号化で保護されています",
      },
      fastProcessing: {
        title: "高速処理",
        description: "最適化されたシステムでより早く結果を取得",
      },
      aiEnabled: {
        title: "AI対応",
        description: "パーソナライズされた支援とガイダンスを受ける",
      },
    },
    benefits: {
      title: "利用可能な給付",
      medicaid: {
        title: "Medicaid",
        description: "低所得の個人と家族のための健康保険",
      },
      snap: {
        title: "SNAP",
        description: "補足栄養支援プログラム",
      },
    },
  },

  // Application Form
  application: {
    title: "給付申請",
    progress: "進捗",
    step: "ステップ",
    of: "の",
    personalInfo: "個人情報",
    household: "世帯",
    income: "収入",
    assets: "資産",
    expenses: "支出",
    review: "確認",
    submit: "送信",

    personalInformation: {
      title: "個人情報",
      firstName: "名",
      lastName: "姓",
      middleName: "ミドルネーム",
      dateOfBirth: "生年月日",
      ssn: "社会保障番号",
      phone: "電話番号",
      email: "メールアドレス",
      address: "住所",
      city: "市",
      state: "州",
      zipCode: "郵便番号",
      county: "郡",
    },

    household: {
      title: "世帯情報",
      size: "世帯人数",
      members: "世帯員",
      addMember: "メンバーを追加",
      relationship: "関係",
      age: "年齢",
      income: "収入",
    },

    income: {
      title: "収入情報",
      employment: "雇用",
      wages: "賃金",
      selfEmployment: "自営業",
      unemployment: "失業給付",
      socialSecurity: "社会保障",
      pension: "年金",
      other: "その他",
    },

    assets: {
      title: "資産",
      checking: "当座預金",
      savings: "普通預金",
      cash: "現金",
      vehicles: "車両",
      property: "不動産",
      investments: "投資",
    },

    expenses: {
      title: "支出",
      rent: "家賃/住宅ローン",
      utilities: "光熱費",
      childcare: "育児費",
      medical: "医療費",
      other: "その他の支出",
    },
  },

  // Validation Messages
  validation: {
    required: "このフィールドは必須です",
    email: "有効なメールアドレスを入力してください",
    phone: "有効な電話番号を入力してください",
    ssn: "有効な社会保障番号を入力してください",
    date: "有効な日付を入力してください",
    number: "有効な数字を入力してください",
    minLength: "最小長: {min}文字",
    maxLength: "最大長: {max}文字",
  },

  // Help & Support
  help: {
    title: "ヘルプとサポート",
    faq: "よくある質問",
    contact: "お問い合わせ",
    documentation: "ドキュメント",
    tutorials: "チュートリアル",

    whatIsMedicaid: "Medicaidとは何ですか？",
    medicaidAnswer: "Medicaidは、収入と資源が限られた人々の医療費をカバーするのに役立つ連邦と州の共同プログラムです。",

    whatIsSNAP: "SNAPとは何ですか？",
    snapAnswer: "SNAP（補足栄養支援プログラム）は、低所得家庭が栄養価の高い食品を購入するのを支援します。",

    howToApply: "どのように申請しますか？",
    applyAnswer: "世帯、収入、支出に関する情報を提供してオンライン申請を完了してください。",

    whatDocuments: "どのような書類が必要ですか？",
    documentsAnswer: "身元、収入、資産、支出を証明する書類が必要です。",

    howLong: "処理にはどのくらい時間がかかりますか？",
    processingAnswer: "処理には通常、Medicaidで30日、SNAPで30日かかります。",
  },

  // Status Messages
  status: {
    submitted: "申請が送信されました",
    pending: "保留中",
    approved: "承認済み",
    denied: "拒否",
    incomplete: "不完全",
    underReview: "審査中",
  },

  // Error Messages
  errors: {
    generic: "エラーが発生しました。もう一度お試しください。",
    network: "ネットワークエラー。インターネット接続を確認してください。",
    timeout: "リクエストがタイムアウトしました。もう一度お試しください。",
    unauthorized: "この操作を実行する権限がありません。",
    notFound: "要求されたリソースが見つかりません。",
    validation: "フォームのエラーを修正してください。",
    upload: "ファイルのアップロードエラー。もう一度お試しください。",
  },
}
