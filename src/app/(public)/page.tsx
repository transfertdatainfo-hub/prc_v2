// src/app/(public)/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowRight,
  Check,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Layers,
  Menu,
  X,
  ChevronRight,
  Globe,
  Filter,
  BarChart3,
  FolderKanban,
  Rss,
  Sparkles,
  Users,
  Clock,
  Lock,
  Unlock,
  Quote,
  Brain,
  Bell,
  Target,
  CheckSquare,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Témoignages
  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Gestionnaire de portefeuille",
      company: "FinCorp",
      content:
        "PRIVATIS CAPITAL m'a fait gagner un temps précieux. Les filtres personnalisés me permettent de suivre exactement ce qui compte pour mes clients.",
      rating: 5,
      image: "SM",
    },
    {
      name: "Thomas Dubois",
      role: "Analyste financier",
      company: "Indépendant",
      content:
        "La catégorisation automatique des articles par sujet est impressionnante. Je reçois une veille stratégique sans aucun effort.",
      rating: 5,
      image: "TD",
    },
    {
      name: "Marie Lambert",
      role: "Directrice des investissements",
      company: "Groupe Avenir",
      content:
        "Les actions et sprints sont parfaits pour suivre mes décisions d'investissement. Une vraie révolution dans mon organisation.",
      rating: 5,
      image: "ML",
    },
  ];

  // Fonctionnalités principales (selon document PRC)
  const features = [
    {
      icon: Rss,
      title: "Flux RSS financiers",
      description:
        "Centralisez tous vos flux RSS en un seul endroit. Sources françaises, canadiennes et internationales. Veille complète sans publicité.",
      color: "blue",
    },
    {
      icon: TrendingUp,
      title: "Suivi des investissements",
      description:
        "Tableau de bord personnalisé. Valeur actuelle, variations, graphiques historiques et actualités liées à chaque produit.",
      color: "green",
    },
    {
      icon: BarChart3,
      title: "Indices boursiers",
      description:
        "Suivez les indices que vous avez choisis. Valeur, variation, composition détaillée et accès direct aux fiches des composants.",
      color: "purple",
    },
    {
      icon: Bell,
      title: "Alertes intelligentes",
      description:
        "Alertes personnalisables : variation de prix, seuils atteints, nouveaux articles. Précises, utiles et non intrusives.",
      color: "amber",
    },
    {
      icon: Brain,
      title: "Intelligence Artificielle",
      description:
        "Analyse instantanée d'un produit financier. Résumé des tendances, mise en contexte, prévisions basées sur données historiques.",
      color: "teal",
    },
    {
      icon: CheckSquare,
      title: "Gestion des tâches (Actions)",
      description:
        "Organisez vos décisions d'investissement en Actions. Chaque Action regroupe les tâches de votre sprint actuel. Suivez vos objectifs pas à pas.",
      color: "red",
    },
  ];

  // Familles d'indicateurs pour le moteur d'alerte
  const alertIndicators = [
    {
      name: "Volatilité & dérivés",
      description: "VIX, volatilité implicite",
      score: 68,
    },
    {
      name: "Crédit & liquidité",
      description: "Spreads de crédit, tensions obligataires",
      score: 72,
    },
    {
      name: "Largeur de marché",
      description: "Moyennes mobiles, plus bas/plus hauts",
      score: 55,
    },
    {
      name: "Flux & comportement",
      description: "Sorties de fonds, volumes de vente",
      score: 60,
    },
    {
      name: "Macro & sentiment",
      description: "Confiance, géopolitique, surprises macro",
      score: 65,
    },
  ];

  // Niveaux d'alerte
  const alertLevels = [
    {
      level: 1,
      name: "Soupçon",
      score: "20-40",
      message: "Restez vigilant, des signaux faibles apparaissent.",
      color: "bg-yellow-500",
    },
    {
      level: 2,
      name: "Début de krach",
      score: "40-60",
      message:
        "Nous entrons dans une phase de correction potentiellement grave.",
      color: "bg-orange-500",
    },
    {
      level: 3,
      name: "En plein dedans",
      score: "60-85",
      message: "Nous sommes en plein krach, les marchés sont en stress majeur.",
      color: "bg-red-500",
    },
    {
      level: 4,
      name: "Trop tard",
      score: "85-100",
      message: "Le krach est avancé, on agit pour limiter les dégâts.",
      color: "bg-red-700",
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* ==================== NAVIGATION ==================== */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl text-gray-800">
                PRIVATIS CAPITAL
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection("alert-system")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Système d&apos;alerte
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Témoignages
              </button>
              <Link
                href="/free"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Mode démo
              </Link>

              {/* Liens conditionnels selon connexion */}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm hover:shadow-md"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 py-2 text-left"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection("alert-system")}
                className="text-gray-600 py-2 text-left"
              >
                Système d&apos;alerte
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-600 py-2 text-left"
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-600 py-2 text-left"
              >
                Témoignages
              </button>
              <Link href="/free" className="text-gray-600 py-2">
                Mode démo
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-600 py-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 py-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-600 py-2">
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl py-3 mt-2"
                  >
                    S&apos;inscrire gratuitement
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">
                Nouveau : IA et Alertes intelligentes
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              La veille financière
              <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                {" "}
                nouvelle génération
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Agrégateur d&apos;actualités, suivi d&apos;investissements,
              indices boursiers et IA. Suivez les marchés, organisez vos idées
              et prenez de meilleures décisions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/free"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-lg"
              >
                Découvrir les fonctionnalités
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div>
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-500">Sources RSS</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-500">Articles par jour</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-500">Langues supportées</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-500">Veille continue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une plateforme complète pour votre veille financière
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              PRIVATIS CAPITAL réunit tout ce dont vous avez besoin pour suivre
              et comprendre vos finances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600",
                green: "bg-green-50 text-green-600",
                purple: "bg-purple-50 text-purple-600",
                amber: "bg-amber-50 text-amber-600",
                teal: "bg-teal-50 text-teal-600",
                red: "bg-red-50 text-red-600",
              }[feature.color];

              return (
                <div
                  key={index}
                  className="group p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 ${colorClasses} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== ALERT SYSTEM SECTION (Le PLUS de PRC) ==================== */}
      <section
        id="alert-system"
        className="py-20 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-6">
              <Bell className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                Le PLUS de PRIVATIS CAPITAL
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Détectez les krachs avant tout le monde
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un moteur d&apos;alerte intelligent qui analyse en continu 5
              familles d&apos;indicateurs de stress
            </p>
          </div>

          {/* Indicateurs de stress */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              5 familles d&apos;indicateurs surveillées
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {alertIndicators.map((indicator, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800 text-sm">
                      {indicator.name}
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      {indicator.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${indicator.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {indicator.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Niveaux d'alerte */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              4 niveaux d&apos;alerte progressifs
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {alertLevels.map((level) => (
                <div
                  key={level.level}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-3 h-3 ${level.color} rounded-full`}
                    ></div>
                    <span className="text-2xl font-bold text-gray-800">
                      Niveau {level.level}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-amber-600">
                      Score: {level.score}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">{level.name}</p>
                  <p className="text-sm text-gray-500">{level.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-600 italic">
              &quot;PRC doit comprendre qu&apos;une baisse de portefeuille
              n&apos;est pas une réallocation volontaire mais un krach&quot;
            </p>
            <p className="text-sm text-gray-500 mt-2">
              — Extrait du cahier des charges PRC
            </p>
          </div>
        </div>
      </section>

      {/* ==================== DEMO PREVIEW SECTION ==================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Essayez sans créer de compte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Accédez immédiatement à la version démo pour tester
              l&apos;application
            </p>
          </div>

          <div className="relative">
            {/* Browser chrome mock */}
            <div className="bg-gray-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1 text-center text-gray-400 text-sm">
                PRIVATIS CAPITAL - Mode démo
              </div>
            </div>

            {/* Preview image placeholder */}
            <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Rss className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Aperçu de l&apos;interface d&apos;actualités
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Filtres, catégories, flux RSS, actions...
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/free"
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold"
            >
              Lancer la démo en incognito
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b from-slate-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs transparents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trois forfaits simples, adaptés à chaque niveau
              d&apos;investisseur
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Forfait 1 - Gratuit */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Freemium
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">0€</span>
                <span className="text-gray-500"> / gratuit</span>
              </div>
              <p className="text-gray-600 mb-6">
                Pour découvrir PRC et suivre l&apos;actualité financière
              </p>

              <Link
                href="/free"
                className="w-full block text-center py-3 rounded-xl font-semibold transition-all mb-6 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Essayer gratuitement
              </Link>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Consultation illimitée des flux RSS</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Accès à la page Actualités</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Interface premium, sans publicité</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Pas d&apos;accès aux investissements</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Pas d&apos;accès aux indices boursiers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Pas de prévisions IA</span>
                </div>
              </div>
            </div>

            {/* Forfait 2 - Premium (recommandé) */}
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-8 border-2 border-amber-200 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                RECOMMANDÉ
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">19,99€</span>
                <span className="text-gray-500"> / mois</span>
              </div>
              <p className="text-gray-600 mb-6">
                Pour les investisseurs actifs
              </p>

              <Link
                href="/auth/register?plan=premium"
                className="w-full block text-center py-3 rounded-xl font-semibold transition-all mb-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md"
              >
                Commencer
              </Link>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Tout du Forfait Freemium</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Accès complet à &quot;Mes investissements&quot;</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Accès aux indices boursiers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Prévisions IA sur demande</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Alertes personnalisées</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Gestion des tâches (Actions)</span>
                </div>
              </div>
            </div>

            {/* Forfait 3 - Expert (Futur) */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Expert</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  À la pièce
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Pour un accompagnement personnalisé
              </p>

              <Link
                href="#"
                className="w-full block text-center py-3 rounded-xl font-semibold transition-all mb-6 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                En savoir plus
              </Link>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Tout du Forfait Premium</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Analyse avancée du portefeuille</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Conseils personnalisés d&apos;un expert</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Module de chat sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS SECTION ==================== */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Rejoignez des centaines de professionnels satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <Quote className="w-8 h-8 text-amber-400 mb-4" />
                <p className="text-gray-600 mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} - {testimonial.company}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL SECTION ==================== */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à transformer votre veille financière ?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Rejoignez PRIVATIS CAPITAL et prenez de meilleures décisions
            d&apos;investissement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/free"
              className="px-8 py-4 bg-white text-amber-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-800 transition-all border border-amber-400"
            >
              Créer un compte
            </Link>
          </div>
          <p className="text-amber-100 text-sm mt-6">
            🔒 Aucune carte bancaire requise pour le mode démo
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-white">PRIVATIS CAPITAL</span>
              </div>
              <p className="text-sm">
                La veille financière nouvelle génération
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white"
                  >
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("alert-system")}
                    className="hover:text-white"
                  >
                    Système d&apos;alerte
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="hover:text-white"
                  >
                    Tarifs
                  </button>
                </li>
                <li>
                  <Link href="/free" className="hover:text-white">
                    Mode démo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 PRIVATIS CAPITAL. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
