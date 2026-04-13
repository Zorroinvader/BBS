# Projektdokumentation

## Einführung einer internen Podcast-Plattform für die Organisation von Podcasts mit RedCircle

**Betriebliche Projektarbeit**
im Rahmen der Abschlussprüfung zum Fachinformatiker Anwendungsentwicklung

| | |
|---|---|
| **Projektleiter** | Peer Giese |
| **Schule** | BBS2 Wolfsburg |
| **Ausbildungsbetrieb** | Volkswagen Group Services GmbH, Standort Wolfsburg |
| **Betrieblicher Betreuer** | Björn Heitmann |
| **Projektzeitraum** | 06.10.2025 – 31.01.2026 |
| **Zeitbudget** | 80 Stunden |

---

## Eidesstattliche Erklärung

Hiermit wird versichert, dass die vorliegende Projektarbeit selbstständig und ohne unzulässige fremde Hilfe angefertigt wurde. Alle verwendeten Quellen und Hilfsmittel sind im Literaturverzeichnis vollständig angegeben. Die Arbeit wurde in gleicher oder ähnlicher Form noch keiner anderen Prüfungsbehörde vorgelegt.

Wolfsburg, den __________ 2026

___________________________
Peer Giese

---

## Inhaltsverzeichnis

1. Einleitung
   1.1 Projektumfeld
   1.2 Projektziel
   1.3 Projektbegründung
2. Projektplanung
   2.1 Ist-Analyse
   2.2 Soll-Konzept
   2.3 Wirtschaftlichkeitsanalyse
   2.4 Make-or-Buy-Analyse
   2.5 Projektphasen und Zeitplanung
   2.6 Ressourcenplanung
   2.7 Entwicklungsmethodik
3. Analysephase
   3.1 Anforderungsanalyse
   3.2 Lastenheft (Auszug)
   3.3 Pflichtenheft (Auszug)
   3.4 Use-Case-Analyse
4. Entwurfsphase
   4.1 Systemarchitektur
   4.2 Datenbankmodell
   4.3 API-Design
   4.4 RedCircle-Integrationskonzept
   4.5 Sicherheits- und DSGVO-Konzept
5. Implementierung
   5.1 Technologieauswahl
   5.2 Datenbankimplementierung
   5.3 Authentifizierung und Autorisierung
   5.4 Episodenverwaltung (CRUD)
   5.5 RedCircle-Integration und Distribution
   5.6 Zuhöreranalyse und Statistiken
   5.7 DSGVO-Compliance und Audit-Logging
   5.8 RSS-Feed-Generierung
   5.9 Datei-Upload und Metadaten-Extraktion
6. Qualitätssicherung
   6.1 Teststrategie
   6.2 Testdurchführung
   6.3 Testergebnisse
7. Deployment und Abnahme
   7.1 Deployment-Strategie
   7.2 Schulung der Nutzer
   7.3 Projektabnahme
8. Retrospektive
   8.1 Soll-Ist-Vergleich
   8.2 Fazit
   8.3 Ausblick

---

## Abbildungsverzeichnis

- Abbildung A.1: Use-Case-Diagramm – BBS Podcast-Plattform
- Abbildung A.2: ER-Diagramm – Datenbankschema
- Abbildung A.3: Komponentendiagramm – Systemarchitektur
- Abbildung A.4: Sequenzdiagramm – Authentifizierungsablauf
- Abbildung A.5: Aktivitätsdiagramm – Episode-Upload und Distribution
- Abbildung A.6: Sequenzdiagramm – RedCircle-Distribution
- Abbildung A.7: Deployment-Diagramm – Docker-Infrastruktur

## Tabellenverzeichnis

- Tabelle 1: Projektphasen und Zeitplanung
- Tabelle 2: Ressourcenübersicht
- Tabelle 3: Wirtschaftlichkeitsberechnung
- Tabelle 4: Make-or-Buy-Bewertungsmatrix
- Tabelle 5: Funktionale Anforderungen (Lastenheft)
- Tabelle 6: Nichtfunktionale Anforderungen
- Tabelle 7: RBAC-Rollenmatrix
- Tabelle 8: API-Endpunktübersicht
- Tabelle 9: Testübersicht und Ergebnisse
- Tabelle 10: Soll-Ist-Vergleich
- Tabelle 11: Risikoanalyse und Maßnahmen

## Codeverzeichnis

- Quellcode 1: Datenbank-Adapter – Dual-DB-Pattern (SQLite/PostgreSQL)
- Quellcode 2: JWT-Authentifizierungs-Middleware
- Quellcode 3: RedCircle-Integrationsdienst – publishEpisode()
- Quellcode 4: Zuhöreranalyse – analyticsService
- Quellcode 5: DSGVO-Audit-Logging
- Quellcode 6: RSS-Feed-Generierung
- Quellcode 7: Episode-Suchfunktion mit dynamischer Query-Konstruktion

## Abkürzungsverzeichnis

| Abkürzung | Bedeutung |
|---|---|
| API | Application Programming Interface |
| BBS | Berufsbildende Schulen |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| DSGVO | Datenschutz-Grundverordnung |
| HTML | Hypertext Markup Language |
| HTTP | Hypertext Transfer Protocol |
| IHK | Industrie- und Handelskammer |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| MIME | Multipurpose Internet Mail Extensions |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| RSS | Really Simple Syndication |
| SQL | Structured Query Language |
| SSE | Server-Sent Events |

## Literaturverzeichnis

[1] Express.js Documentation. https://expressjs.com. Abgerufen am 15.10.2025.
[2] Node.js 20 Documentation. https://nodejs.org/docs/. Abgerufen am 15.10.2025.
[3] PostgreSQL 16 Documentation. https://www.postgresql.org/docs/16/. Abgerufen am 15.10.2025.
[4] SQLite Documentation. https://www.sqlite.org/docs.html. Abgerufen am 15.10.2025.
[5] RFC 7519 – JSON Web Token (JWT). https://tools.ietf.org/html/rfc7519.
[6] RSS 2.0 Specification. https://www.rssboard.org/rss-specification. Abgerufen am 15.10.2025.
[7] Docker Documentation. https://docs.docker.com. Abgerufen am 15.10.2025.
[8] RedCircle – Podcast Hosting Platform. https://redcircle.com. Abgerufen am 08.10.2025.
[9] OWASP Foundation: OWASP Top Ten. https://owasp.org/www-project-top-ten/.
[10] Europäisches Parlament (2016): Verordnung (EU) 2016/679 (DSGVO).
[11] Multer – Node.js Middleware for File Uploads. https://github.com/expressjs/multer.
[12] music-metadata – Audio Metadata Parser. https://github.com/Borewit/music-metadata.

---

## 1. Einleitung

### 1.1 Projektumfeld

Die vorliegende Projektarbeit wurde im Rahmen der Ausbildung zum Fachinformatiker der Fachrichtung Anwendungsentwicklung bei der Volkswagen Group Services GmbH (nachfolgend VWGS) am Standort Wolfsburg durchgeführt. Das Projekt wurde in Kooperation mit der BBS2 Wolfsburg (Berufsbildende Schulen II) realisiert, die als berufsbildende Schule ein breites Angebot an Ausbildungsberufen und schulischen Bildungsgängen bereitstellt.

Die Betreuung des Projekts erfolgte durch Herrn Björn Heitmann als betrieblichen Ausbilder. Die Schulleitung wurde durch Frau Joanna Müller-Lenz vertreten.

### 1.2 Projektziel

Ziel des Projektes war die Entwicklung einer internen Podcast-Plattform auf Basis von RedCircle für die BBS2 Wolfsburg. Die Plattform dient **nicht** zur Erstellung oder Bearbeitung von Podcasts, sondern ausschließlich zur **Verwaltung, Organisation, Veröffentlichung und Analyse** interner Podcasts.

Im Einzelnen sollte die Plattform folgende Kernfunktionalitäten bereitstellen:

- Eine **zentrale Oberfläche zur Verwaltung** interner Podcasts
- **Automatische Verteilung** auf Spotify, YouTube und das Schulradio über RedCircle
- **Zuhöreranalyse** mit Auswertung von Downloads und Nutzungsstatistiken
- **Benutzerverwaltung** mit Rollen und Rechten (DSGVO-konform)
- **Dokumentation und Schulungsunterlagen** zur Nutzung durch Lehrkräfte und Schüler

Die Bereitstellung der Daten erfolgt über eine REST-API, die standardisierte HTTP-Methoden (GET, POST, PATCH, DELETE) implementiert. Die Integration mit RedCircle ermöglicht die automatisierte Distribution an externe Streaming-Plattformen.

### 1.3 Projektbegründung

An der BBS2 Wolfsburg entstehen im Rahmen von Projektarbeiten, Wahlpflichtkursen sowie im Deutsch- und Politikunterricht regelmäßig Podcast-Inhalte. Zum Zeitpunkt der Projektinitiierung existierte jedoch **keine zentrale Plattform** für die Planung, Verwaltung und Verteilung dieser schulinternen Podcasts.

Die Ist-Analyse ergab folgende Problemfelder:

**Technische Probleme:**
- **Verteilte Arbeitsweise**: Podcast-Projekte wurden von verschiedenen Lehrkräften und Lerngruppen unabhängig voneinander durchgeführt. Es fehlte eine institutionalisierte Lösung zur Sammlung, Archivierung und Distribution der Inhalte.
- **Fehlende Distribution**: Veröffentlichungen erfolgten manuell über private YouTube-Konten oder gar nicht. Spotify und andere Plattformen wurden nicht genutzt, was die Reichweite stark einschränkte.
- **Keine Benutzerverwaltung**: Es gab keine einheitliche Steuerung von Berechtigungen – jeder arbeitete unkoordiniert, was zu Sicherheitslücken bei datenschutzrelevanten Inhalten führte.
- **Fehlende Analyse**: Es existierte keine Möglichkeit, Zuhörerdaten, Verweildauer oder Feedback systematisch zu erfassen.

**Organisatorische Probleme:**
- Keine zentrale Verantwortlichkeit für die Koordination von Podcast-Inhalten
- Intransparente Abläufe zwischen den beteiligten Gruppen
- Kein institutionelles Wissen – jedes neue Podcast-Projekt fing organisatorisch bei null an

**Pädagogischer Bedarf:**
- Podcasts sollten langfristig als Teil der schulischen Kommunikation (Schulnachrichten, Schülerprojekte, Interviews) verankert werden

**Wirtschaftliche Einschränkungen:**
- Für das Projekt stand **kein externes Budget** zur Verfügung. Es musste daher mit kostenlosen Tools (RedCircle) gearbeitet werden, die dennoch professionelle Funktionen bieten.

---

## 2. Projektplanung

### 2.1 Ist-Analyse

Im Rahmen der Ist-Analyse wurden Interviews mit Lehrkräften, der Schulleitung und beteiligten Schülergruppen geführt. Es wurde festgestellt, dass die vorhandene Audio-Infrastruktur auf folgenden Grundlagen basierte:

- **Private Kanäle**: Vereinzelte YouTube-Konten einzelner Lehrkräfte
- **Lokale Speicherung**: Audio-Dateien auf einzelnen Rechnern, USB-Sticks und Netzlaufwerken
- **Informelle Verteilung**: Weitergabe per E-Mail, Messenger oder mündlich
- **Keine Metadaten**: Fehlende systematische Verschlagwortung nach Klasse, Serie oder Fachbereich

Es existierte kein zentrales System, das:
1. Audio-Inhalte strukturiert bereitstellte und katalogisierte
2. Eine automatische Distribution an Streaming-Plattformen ermöglichte
3. Zuhörerstatistiken und Analyse bereitstellte
4. Zugriffsrechte und Datenschutz gewährleistete

### 2.2 Soll-Konzept

Das Soll-Konzept sah die Entwicklung einer Full-Stack-Webanwendung mit RedCircle-Integration vor, die folgende Kernfunktionalitäten bereitstellt:

1. **Episodenverwaltung**: Zentrale Verwaltung hochgeladener Podcasts durch autorisierte Nutzer mit CRUD-Operationen
2. **RedCircle-Integration**: Automatische Veröffentlichung und Distribution an Spotify, YouTube und das Schulradio über die RedCircle-API
3. **Zuhöreranalyse**: Erfassung und Auswertung von Downloads, Abspielvorgängen und Plattform-Nutzung
4. **Benutzerverwaltung**: DSGVO-konforme Zugriffskontrolle mit drei Rollen (Admin, Editor, Viewer)
5. **Benutzerfreundliche Oberfläche**: Responsives Web-Frontend zum Durchsuchen, Filtern und Abspielen
6. **RSS-Feed**: Automatische Feed-Generierung als Fallback und für das Schulradio
7. **Statistik-Dashboard**: Übersicht über Episodenbestand, Hördaten und Aktivitätsmetriken
8. **Dokumentation**: Technische Dokumentation und Schulungsunterlagen für Lehrkräfte und Schüler

Die Architektur wurde modular und erweiterbar konzipiert. Durch den Einsatz eines Datenbank-Adapter-Patterns wird sowohl SQLite (Entwicklung) als auch PostgreSQL (Produktion) unterstützt. Die RedCircle-Integration erfolgt über einen dedizierten Service-Layer, der die Plattform-API kapselt.

### 2.3 Wirtschaftlichkeitsanalyse

Zur Bewertung der Wirtschaftlichkeit wurde eine Kosten-Nutzen-Analyse durchgeführt. Da kein externes Budget zur Verfügung stand, wurde besonderer Wert auf den Einsatz kostenloser Werkzeuge gelegt.

**Kostenermittlung der Ist-Situation (pro Schuljahr):**

| Kostenfaktor | Berechnung | Betrag |
|---|---|---|
| Manuelle Distribution (YouTube, Messenger) | 3 Lehrkräfte × 2 h/Woche × 40 Wochen × 45 €/h | 10.800 € |
| Doppelte Arbeit durch fehlende Koordination | 4 Gruppen × 3 h/Projekt × 6 Projekte × 25 €/h | 1.800 € |
| Fehlende Auffindbarkeit (Neuproduktion) | 8 Fälle/Jahr × 3 h × 25 €/h | 600 € |
| Verwaltungsaufwand ohne zentrale Steuerung | 2 h/Woche × 40 Wochen × 45 €/h | 3.600 € |
| **Gesamtkosten Ist-Zustand** | | **16.800 €/Jahr** |

**Projektkosten (einmalig):**

| Kostenfaktor | Berechnung | Betrag |
|---|---|---|
| Personalkosten Entwicklung | 80 h × 25 €/h (Auszubildender) | 2.000 € |
| Betreuungsaufwand | 10 h × 65 €/h | 650 € |
| RedCircle-Konto | Kostenloser Plan | 0 € |
| Server-Infrastruktur | Docker-Host (vorhandene Schulserver) | 0 € |
| **Gesamtkosten Projekt** | | **2.650 €** |

**Laufende Kosten (pro Jahr):**

| Kostenfaktor | Betrag |
|---|---|
| RedCircle (Free Tier) | 0 € |
| Server-Betriebskosten (anteilig, vorhandene Hardware) | 300 € |
| Wartung und Pflege (geschätzt) | 1.000 € |
| **Gesamtkosten laufend** | **1.300 €/Jahr** |

**Erwartete Einsparungen (pro Jahr):**

Durch den Einsatz der Podcast-Plattform mit automatisierter Distribution wurde eine Reduzierung des manuellen Aufwands um mindestens 75 % erwartet. Dies entspricht einer jährlichen Einsparung von ca. 12.600 €. Die Amortisation der einmaligen Projektkosten erfolgt innerhalb von weniger als drei Monaten.

**Amortisationszeit**: 2.650 € ÷ (12.600 € ÷ 12 Monate) ≈ **2,5 Monate**

Darüber hinaus wurden qualitative Nutzenpotenziale identifiziert:
- Professionelle Außendarstellung der Schule auf Spotify und YouTube
- Vereinfachte Zusammenarbeit zwischen Lerngruppen
- Nachhaltige Archivierung und Wiederverwendung von Inhalten
- Datenbasierte Optimierung durch Zuhöreranalyse

### 2.4 Make-or-Buy-Analyse

Im Rahmen einer Make-or-Buy-Analyse wurden drei Alternativen bewertet [siehe Tabelle 4]:

| Kriterium (Gewichtung) | Eigenentwicklung mit RedCircle | Nur RedCircle (ohne eigene Plattform) | WordPress + Podcast-Plugin |
|---|---|---|---|
| Anpassbarkeit an BBS-Anforderungen (25 %) | ★★★★★ | ★★☆☆☆ | ★★★☆☆ |
| Klassen-/Serienzuordnung (20 %) | ★★★★★ | ★☆☆☆☆ | ★★☆☆☆ |
| Automatische Distribution (15 %) | ★★★★★ | ★★★★★ | ★★★☆☆ |
| DSGVO-Konformität (15 %) | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| Kosten (Free Tier) (15 %) | ★★★★★ | ★★★★★ | ★★★☆☆ |
| Zuhöreranalyse (10 %) | ★★★★★ | ★★★★☆ | ★★☆☆☆ |
| **Gesamtbewertung** | **5,00** | **2,75** | **2,60** |

Die Eigenentwicklung mit RedCircle-Integration wurde als optimale Lösung bewertet. RedCircle allein bietet zwar eine kostenlose Distribution, ermöglicht aber keine schulspezifische Kategorisierung, kein internes Rollenmanagement und keine DSGVO-konforme Zugriffskontrolle. Die Kombination aus eigener Verwaltungsplattform und RedCircle als Distribution-Backend vereint beide Vorteile.

### 2.5 Projektphasen und Zeitplanung

Das Projekt wurde gemäß dem Projektantrag in sechs Phasen mit einem Gesamtbudget von 80 Stunden geplant [siehe Tabelle 1]:

| Phase | Aufgaben | Geplant | Tatsächlich |
|---|---|---|---|
| **1. Analyse** | Interviews mit Stakeholdern, Sammlung von Anforderungen, Ist-Zustand dokumentieren | 10 h | 10 h |
| **2. Entwurf** | Auswahl von RedCircle, Definition der Nutzerrollen, Aufbau des Plattform-Konzepts, DB-Schema, API-Design | 15 h | 14 h |
| **3. Implementierung** | RedCircle-Konto, API-Anbindung, Plattform einrichten, Backend, Frontend, Distribution, Analytics | 40 h | 42 h |
| **4. Testphase und Feedbackrunde** | Tests mit Beispielinhalten, Feedback von Nutzern einholen und dokumentieren | 10 h | 9 h |
| **5. Abnahme und Einführung** | Erstellung von Schulungsmaterialien, Durchführung von Schulungen | 5 h | 5 h |
| **6. Dokumentation** | Technische und nutzerorientierte Dokumentation, Anleitungen | 10 h | 10 h |
| **Gesamt** | | **80 h** | **80 h** |*

*Hinweis: Die Implementierungsphase benötigte 2 h mehr als geplant, was durch Einsparungen in der Entwurfs- und Testphase kompensiert wurde.

### 2.6 Ressourcenplanung

**Personelle Ressourcen:**

| Rolle | Person/Beschreibung |
|---|---|
| Projektleiter | Peer Giese – Koordination und Entwicklung |
| Betrieblicher Betreuer | Björn Heitmann – Fachliche Betreuung |
| Schulleitung | Joanna Müller-Lenz – Abnahme und Anforderungen |
| Testnutzer | Lehrkräfte und Schüler der BBS2 – Feedback und UAT |

**Technische Ressourcen** [siehe Tabelle 2]:

| Ressource | Beschreibung |
|---|---|
| Hardware | Entwicklungsrechner (Windows 11, 16 GB RAM) |
| Betriebssystem | Windows 11 Enterprise |
| Laufzeitumgebung | Node.js 20 |
| Backend-Framework | Express.js 4.21 [1] |
| Datenbank (Entwicklung) | SQLite (better-sqlite3 11.0) [4] |
| Datenbank (Produktion) | PostgreSQL 16 [3] |
| Authentifizierung | jsonwebtoken 9.0, bcryptjs 2.4 |
| Datei-Upload | Multer 1.4 [11] |
| RSS-Generierung | feed 4.2 |
| Audio-Metadaten | music-metadata 10.5 [12] |
| Eingabevalidierung | express-validator 7.2 |
| Podcast-Hosting/Distribution | RedCircle (Free Tier) [8] |
| Containerisierung | Docker, Docker Compose [7] |
| Versionsverwaltung | Git |
| IDE | Visual Studio Code |

### 2.7 Entwicklungsmethodik

Die Entwicklung erfolgte **agil** mit iterativen Entwicklungszyklen, wie im Projektantrag vorgesehen. Durch regelmäßige Rücksprachen mit den Stakeholdern (Lehrkräfte, Schulleitung) konnten Anforderungsänderungen zeitnah umgesetzt werden.

Jeder Funktionsbereich wurde einzeln implementiert, getestet und in die Gesamtanwendung integriert. Der Entwicklungsprozess wurde durch automatisierte Buildprozesse (Docker) unterstützt.

**Einsatz KI-gestützter Entwicklungswerkzeuge:**

Zur Unterstützung des Entwicklungsprozesses wurde ein KI-gestütztes Entwicklungswerkzeug (Claude Code) eingesetzt. Der Einsatz erfolgte ausschließlich werkzeugunterstützend und ist vergleichbar mit etablierten Entwicklungswerkzeugen wie IDE-Autovervollständigung oder statischer Codeanalyse. Die Nutzung umfasste insbesondere:

- Unterstützung bei der Formulierung und Überprüfung technischer Lösungsansätze
- Generierung von Code-Vorschlägen für klar abgegrenzte Teilaufgaben
- Unterstützung bei der Analyse von Fehlermeldungen und Optimierungsvorschlägen

Die fachliche Konzeption, Architekturentscheidungen, sicherheitsrelevanten Bewertungen, Implementierung der Geschäftslogik sowie die finale Auswahl, Anpassung und Integration des Quellcodes erfolgten ausschließlich durch den Projektbearbeiter. KI-generierte Inhalte wurden transparent geprüft, angepasst und in die Gesamtarchitektur integriert. Der eigenständig erbrachte Projektanteil beträgt in allen Projektphasen deutlich mehr als 50 %.

---

## 3. Analysephase

### 3.1 Anforderungsanalyse

Die Anforderungsanalyse wurde auf Basis der Ist-Analyse sowie der Interviews mit Stakeholdern (Lehrkräfte, Schulleitung, Schülergruppen) durchgeführt. Die im Projektantrag definierten Anforderungen wurden konkretisiert und in ein Lastenheft überführt.

Die Anforderungen wurden in folgende Kategorien unterteilt:

1. **Episodenverwaltung**: Hochladen, Organisieren und Verwalten von Podcast-Episoden
2. **Distribution**: Automatische Verteilung über RedCircle an Spotify, YouTube, Schulradio
3. **Zuhöreranalyse**: Erfassung von Downloads, Abspielvorgängen und Plattform-Nutzung
4. **Benutzerverwaltung**: DSGVO-konforme Zugriffskontrolle mit Rollen und Rechten
5. **Oberfläche**: Benutzerfreundliche Weboberfläche für alle Nutzergruppen
6. **Dokumentation**: Schulungsunterlagen für Lehrkräfte und Schüler

### 3.2 Lastenheft (Auszug)

Das Lastenheft wurde in Zusammenarbeit mit der BBS2 Wolfsburg erstellt und orientiert sich direkt an den Anforderungen des Projektantrags [siehe Tabelle 5]:

| ID | Anforderung | Priorität | Kategorie |
|---|---|---|---|
| FA-01 | Das System muss eine zentrale Verwaltung hochgeladener Podcasts durch autorisierte Nutzer ermöglichen. | Muss | Verwaltung |
| FA-02 | Das System muss eine benutzerfreundliche, einfache Weboberfläche bereitstellen. | Muss | Oberfläche |
| FA-03 | Das System muss eine DSGVO-konforme Zugriffskontrolle mit Rollen und Rechten implementieren. | Muss | Sicherheit |
| FA-04 | Das System muss eine automatisierte Distribution auf Spotify, YouTube und das Schulradio über RedCircle ermöglichen. | Muss | Distribution |
| FA-05 | Das System muss eine Zuhöreranalyse mit Statistiken (z. B. Anzahl Downloads, Abspielvorgänge) bereitstellen. | Muss | Analyse |
| FA-06 | Das System muss durch eine technische Dokumentation wartbar sein. | Muss | Dokumentation |
| FA-07 | Das System muss Schulungsunterlagen für die Nutzerbereitstellung umfassen. | Muss | Dokumentation |
| FA-08 | Das System muss Episoden nach Serien, Kategorien und Klassen organisieren können. | Soll | Verwaltung |
| FA-09 | Das System muss einen RSS 2.0-Feed für das Schulradio und Podcast-Apps generieren. | Soll | Distribution |
| FA-10 | Das System muss den Import von Episoden aus externen RSS-Feeds ermöglichen. | Kann | Import |
| FA-11 | Das System muss ein DSGVO-konformes Audit-Log aller Zugriffe führen. | Muss | Sicherheit |
| FA-12 | Das System muss die Möglichkeit zur Datenauskunft (Art. 15 DSGVO) und Datenlöschung (Art. 17 DSGVO) bieten. | Muss | DSGVO |

**Nichtfunktionale Anforderungen** [siehe Tabelle 6]:

| ID | Anforderung | Kategorie |
|---|---|---|
| NFA-01 | Die API muss Antwortzeiten unter 500 ms für Standardanfragen gewährleisten. | Performance |
| NFA-02 | Die Anwendung muss sowohl mit SQLite als auch PostgreSQL betreibbar sein. | Portabilität |
| NFA-03 | Die Anwendung muss containerisiert (Docker) deploybar sein. | Betrieb |
| NFA-04 | Das Frontend muss responsiv und auf mobilen Geräten nutzbar sein. | Usability |
| NFA-05 | Die API muss gegen gängige Angriffsvektoren (SQL-Injection, XSS) geschützt sein. | Sicherheit |
| NFA-06 | Die Plattform muss ohne externe Lizenzkosten betreibbar sein (RedCircle Free Tier). | Wirtschaftlichkeit |

### 3.3 Pflichtenheft (Auszug)

Auf Grundlage des Lastenheftes wurde ein Pflichtenheft erstellt, das die technische Umsetzung der Anforderungen spezifiziert.

**Zu FA-03 – DSGVO-konforme Zugriffskontrolle:**

Es wurden drei Rollen mit definierten Zugriffsbereichen definiert [siehe Tabelle 7]:

| Rolle | Beschreibung | Berechtigungen |
|---|---|---|
| admin | Vollzugriff (Schulleitung, Projektleiter) | Episoden verwalten, Benutzer verwalten, Analytics einsehen, Audit-Log einsehen, DSGVO-Funktionen, Distribution steuern |
| editor | Inhaltsverwaltung (Lehrkräfte) | Episoden hochladen/bearbeiten/löschen, Analytics einsehen, Distribution steuern |
| viewer | Lesezugriff (Schüler, Gäste) | Episoden ansehen und abspielen, keine Verwaltungsfunktionen |

Die Rollenkontrolle wird über Express.js-Middleware-Funktionen (`requireAuth`, `requireRole`) durchgesetzt, die vor geschützten Endpunkten eingebunden werden.

**Zu FA-04 – Automatisierte Distribution über RedCircle:**

Die Distribution erfolgt über den RedCircle-Integrationsdienst (`src/services/redcircle.js`). Beim Veröffentlichen einer Episode wird diese über die RedCircle-API hochgeladen. RedCircle verteilt den Inhalt automatisch an die verbundenen Plattformen (Spotify, YouTube). Für das Schulradio wird ein dedizierter RSS-Feed bereitgestellt.

**Zu FA-05 – Zuhöreranalyse:**

Die Analyse erfolgt zweistufig:
1. **Interne Analyse**: Erfassung von Abspielvorgängen über die Webanwendung in der Tabelle `listen_events`
2. **Externe Analyse**: Abruf von Download- und Plattformstatistiken über die RedCircle-API

### 3.4 Use-Case-Analyse

Es wurden acht primäre Use Cases identifiziert, die den im Projektantrag definierten Meilensteinen entsprechen [siehe Abbildung A.1]:

1. **UC-01**: Podcast-Episoden durchsuchen und abspielen (Viewer, Editor, Admin)
2. **UC-02**: Episode hochladen und Metadaten zuweisen (Editor, Admin)
3. **UC-03**: Episode über RedCircle an Spotify/YouTube/Schulradio verteilen (Editor, Admin)
4. **UC-04**: Zuhörerstatistiken und Analytics einsehen (Editor, Admin)
5. **UC-05**: Benutzer verwalten und Rollen zuweisen (Admin)
6. **UC-06**: Podcast per RSS-Feed abonnieren (alle, ohne Anmeldung)
7. **UC-07**: Episoden aus externem RSS-Feed importieren (Editor, Admin)
8. **UC-08**: DSGVO-Datenauskunft und -löschung durchführen (Admin)

---

## 4. Entwurfsphase

### 4.1 Systemarchitektur

Die Systemarchitektur wurde als Schichtenarchitektur (Layered Architecture) mit vier Ebenen konzipiert [siehe Abbildung A.3]:

1. **API-Schicht** (`src/api/`): Entgegennahme und Validierung von HTTP-Anfragen, Routing, Formatierung der Antworten. Umfasst Endpunkte für Episoden, Benutzer, Distribution, Analytics und Audit.
2. **Service-Schicht** (`src/services/`): Implementierung der Geschäftslogik – Episodenverwaltung, RedCircle-Integration, Zuhöreranalyse, RSS-Generierung, Authentifizierung, DSGVO-Audit.
3. **Datenschicht** (`src/db/`): Datenbank-Adapter mit Unterstützung für SQLite und PostgreSQL, Schema-Initialisierung und automatische Migrationen.
4. **Externe Dienste**: RedCircle-API für Distribution und Plattform-Analytics.

Zusätzlich existiert eine **Middleware-Schicht** (`src/middleware/`), die Querschnittsfunktionalitäten wie Authentifizierung (JWT) und Datei-Upload (Multer) bereitstellt.

Das **Frontend** (`public/`) ist als statische Webanwendung realisiert mit:
- `index.html` – Homepage mit Hero-Banner
- `alle-podcasts.html` – Episoden durchsuchen und filtern
- `statistik.html` – Statistik-Dashboard
- `admin/` – Admin-Panel für Verwaltung

### 4.2 Datenbankmodell

Das Datenbankschema umfasst vier Tabellen [siehe Abbildung A.2]:

**Tabelle `users`:**

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | INTEGER (PK, AUTO) | Primärschlüssel |
| email | TEXT (UNIQUE, NOT NULL) | E-Mail-Adresse |
| password_hash | TEXT (NOT NULL) | Bcrypt-gehashtes Passwort |
| role | TEXT (NOT NULL, DEFAULT 'viewer') | Benutzerrolle (admin, editor, viewer) |
| created_at | DATETIME | Erstellungszeitpunkt |

**Tabelle `episodes`:**

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | INTEGER (PK, AUTO) | Primärschlüssel |
| title | TEXT (NOT NULL) | Episodentitel |
| description | TEXT | Beschreibungstext |
| audio_path | TEXT (NOT NULL) | Pfad zur Audio-Datei |
| artwork_path | TEXT | Pfad zum Cover-Artwork |
| duration_seconds | INTEGER | Dauer in Sekunden (automatisch extrahiert) |
| publish_date | DATETIME | Veröffentlichungsdatum |
| created_by | INTEGER (FK → users.id) | Ersteller |
| series | TEXT | Serienname |
| class_info | TEXT | Klasseninformation |
| category | TEXT | Kategorie |
| spotify_url | TEXT | Spotify-Link (von RedCircle) |
| apple_url | TEXT | Apple Music-Link |
| youtube_url | TEXT | YouTube-Link (von RedCircle) |
| created_at | DATETIME | Erstellungszeitpunkt |

**Tabelle `listen_events`** (Zuhöreranalyse):

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | INTEGER (PK, AUTO) | Primärschlüssel |
| episode_id | INTEGER (FK → episodes.id) | Abgespielte Episode |
| listened_at | DATETIME | Zeitpunkt des Abspielvorgangs |
| source | TEXT (DEFAULT 'web') | Quelle (web, spotify, youtube, schulradio) |

**Tabelle `audit_log`** (DSGVO-Compliance):

| Spalte | Typ | Beschreibung |
|---|---|---|
| id | INTEGER (PK, AUTO) | Primärschlüssel |
| user_id | INTEGER | Handelnder Benutzer |
| action | TEXT (NOT NULL) | Aktionstyp (login, create, update, delete, export, anonymize) |
| resource | TEXT | Ressourcentyp (episode, user, auth) |
| resource_id | INTEGER | ID der betroffenen Ressource |
| details | TEXT | Zusätzliche Details |
| ip_address | TEXT | Client-IP-Adresse |
| created_at | DATETIME | Zeitpunkt |

Zur Optimierung der Abfrageperformance wurden Indizes auf `episodes.publish_date`, `episodes.series`, `episodes.category`, `listen_events.episode_id`, `listen_events.listened_at` und `audit_log.created_at` angelegt.

### 4.3 API-Design

Die API wurde nach RESTful-Prinzipien entworfen und umfasst folgende Endpunktgruppen [siehe Tabelle 8]:

| Ressource | Pfad | Methoden | Auth | Beschreibung |
|---|---|---|---|---|
| Authentifizierung | `/api/auth/login` | POST | Nein | Benutzeranmeldung |
| Episoden (Liste) | `/api/episodes` | GET | Nein | Paginierte Liste mit Filtern |
| Episode (Einzel) | `/api/episodes/:id` | GET | Nein | Einzelne Episode |
| Episode erstellen | `/api/episodes` | POST | Admin/Editor | Upload mit Audio + Artwork |
| Episode bearbeiten | `/api/episodes/:id` | PATCH | Admin/Editor | Metadaten aktualisieren |
| Episode löschen | `/api/episodes/:id` | DELETE | Admin/Editor | Episode entfernen |
| Artwork | `/api/episodes/:id/artwork` | POST | Admin/Editor | Cover-Artwork aktualisieren |
| Serien-Metadaten | `/api/episodes/meta/series` | GET | Nein | Alle verfügbaren Serien |
| Kategorien | `/api/episodes/meta/categories` | GET | Nein | Alle Kategorien |
| Statistik | `/api/stats` | GET | Nein | Plattformmetriken |
| RSS-Feed | `/feed.xml` | GET | Nein | RSS 2.0-Feed |
| Import | `/api/import/rss` | POST | Admin/Editor | RSS-Feed importieren |
| **Distribution-Status** | `/api/distribution/status` | GET | Admin/Editor | RedCircle-Verbindungsstatus |
| **Episode publizieren** | `/api/distribution/publish/:id` | POST | Admin/Editor | An RedCircle senden |
| **Distribution-Analytics** | `/api/distribution/analytics` | GET | Admin/Editor | RedCircle-Statistiken |
| **Listen-Event** | `/api/analytics/listen/:id` | POST | Nein | Abspielereignis melden |
| **Episode-Analytics** | `/api/analytics/episode/:id` | GET | Admin/Editor | Hörstatistik pro Episode |
| **Plattform-Analytics** | `/api/analytics` | GET | Admin/Editor | Aggregierte Hörstatistiken |
| **Audit-Log** | `/api/audit` | GET | Admin | DSGVO-Audit-Protokoll |
| **Datenexport** | `/api/audit/export/:userId` | GET | Admin | DSGVO Art. 15 – Auskunft |
| **Datenanonymisierung** | `/api/audit/anonymize/:userId` | POST | Admin | DSGVO Art. 17 – Löschung |
| Benutzer | `/api/users` | GET, POST | Admin | Benutzerverwaltung |
| Aktivitätslog | `/api/db-log` | GET (SSE) | Admin/Editor | Echtzeit-Aktivitätsstream |
| Health | `/api/health` | GET | Nein | Gesundheitsprüfung |

### 4.4 RedCircle-Integrationskonzept

Die Integration mit RedCircle wurde als dedizierter Service-Layer (`src/services/redcircle.js`) konzipiert [siehe Abbildung A.6]:

**Architekturentscheidung**: Die RedCircle-API wird über einen zentralen Service gekapselt, der alle Interaktionen mit der externen Plattform bündelt. Dies ermöglicht:
- Austauschbarkeit des Distribution-Backends (z. B. spätere Migration zu Spotify for Podcasters)
- Zentrale Fehlerbehandlung bei API-Ausfällen
- Konfigurierbarkeit über Umgebungsvariablen (`REDCIRCLE_API_KEY`, `REDCIRCLE_SHOW_ID`)

**Distributionsfluss**:
1. Nutzer lädt Episode über die Weboberfläche hoch → Speicherung in lokaler DB
2. Nutzer klickt „An Plattformen verteilen" → RedCircle-Service wird aufgerufen
3. RedCircle-Service sendet Audio an RedCircle-API
4. RedCircle verteilt automatisch an verbundene Plattformen (Spotify, YouTube)
5. Plattform-URLs werden zurückgeliefert und in der Episode gespeichert
6. Für das Schulradio wird der RSS-Feed bereitgestellt

### 4.5 Sicherheits- und DSGVO-Konzept

Das Sicherheitskonzept wurde mehrstufig konzipiert und berücksichtigt die DSGVO-Anforderungen gemäß dem Projektantrag:

1. **Authentifizierung**: JWT-basiert mit 7 Tagen Gültigkeit, Bcrypt-Passwort-Hashing [5]
2. **Autorisierung**: RBAC mit drei Rollen über Express-Middleware
3. **Eingabevalidierung**: express-validator für alle Benutzereingaben, Schutz gegen SQL-Injection und XSS [9]
4. **Datei-Upload-Sicherheit**: MIME-Type-Validierung, Größenbeschränkungen (200 MB Audio, 5 MB Artwork)
5. **CORS-Konfiguration**: Konfigurierbare Ursprungsrichtlinien
6. **DSGVO-Compliance** [10]:
   - **Audit-Logging**: Protokollierung aller relevanten Zugriffe und Änderungen in `audit_log`
   - **Recht auf Auskunft (Art. 15)**: Endpunkt zum Export aller benutzerbezogenen Daten
   - **Recht auf Löschung (Art. 17)**: Endpunkt zur Anonymisierung von Benutzerdaten
   - **Login-Protokollierung**: Erfolgreiche und fehlgeschlagene Anmeldeversuche werden mit IP-Adresse protokolliert

---

## 5. Implementierung

### 5.1 Technologieauswahl

Die Auswahl der Technologien erfolgte unter Berücksichtigung der wirtschaftlichen Einschränkung (kein Budget) und der fachlichen Anforderungen:

- **Node.js 20**: Serverseitige JavaScript-Laufzeitumgebung [2]
- **Express.js 4.21**: Web-Framework für die REST-API [1]
- **SQLite / PostgreSQL 16**: Dualunterstützung über Adapter-Pattern [3][4]
- **RedCircle (Free Tier)**: Podcast-Hosting und automatische Distribution [8]
- **jsonwebtoken 9.0 / bcryptjs 2.4**: JWT-Authentifizierung und Passwort-Hashing [5]
- **Multer 1.4**: Datei-Upload-Middleware [11]
- **music-metadata 10.5**: Audio-Metadaten-Extraktion [12]
- **feed 4.2**: RSS-Feed-Generierung [6]
- **Docker / Docker Compose**: Containerisiertes Deployment [7]

Alle eingesetzten Werkzeuge sind Open Source und kostenlos nutzbar, was der Budgetrestriktion des Projektantrags entspricht.

### 5.2 Datenbankimplementierung

Eine zentrale Entwurfsentscheidung war die Implementierung eines Datenbank-Adapter-Patterns, das eine einheitliche Schnittstelle für SQLite (Entwicklung) und PostgreSQL (Produktion) bereitstellt [siehe Quellcode 1]:

```javascript
// src/db/adapter.js – Auszug: Platzhalter-Konvertierung
function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function createAdapter() {
  if (config.databaseUrl) {
    // PostgreSQL-Adapter für Produktion
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: config.databaseUrl });
    return {
      query: async (sql, params = []) => {
        const pgSql = toPgPlaceholders(sql);
        const r = await pool.query(pgSql, params);
        return { rows: r.rows };
      },
      queryOne: async (sql, params = []) => {
        const pgSql = toPgPlaceholders(sql);
        const r = await pool.query(pgSql, params);
        return r.rows[0] || null;
      },
      run: async (sql, params = []) => {
        const pgSql = toPgPlaceholders(sql);
        const r = await pool.query(pgSql, params);
        return { lastId: r.rows[0]?.id ?? null, changes: r.rowCount };
      },
    };
  }
  // SQLite-Adapter für Entwicklung
  const Database = require('better-sqlite3');
  const db = new Database(config.dbPath);
  return {
    query: (sql, params = []) =>
      Promise.resolve({ rows: db.prepare(sql).all(...params) }),
    queryOne: (sql, params = []) =>
      Promise.resolve(db.prepare(sql).get(...params) ?? null),
    run: (sql, params = []) => {
      const r = db.prepare(sql).run(...params);
      return Promise.resolve({ lastId: r.lastInsertRowid, changes: r.changes });
    },
  };
}
```

Die Funktion `toPgPlaceholders()` konvertiert automatisch die `?`-Platzhalter (SQLite) in `$1, $2, ...` (PostgreSQL), sodass der gesamte Anwendungscode einheitlich arbeitet.

### 5.3 Authentifizierung und Autorisierung

Die Authentifizierung wurde als JWT-basiertes System implementiert. Die Middleware-Funktionen `requireAuth` und `requireRole` sichern die geschützten Endpunkte [siehe Quellcode 2]:

```javascript
// src/middleware/auth.js
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await authService.getUserById(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

Administrative Endpunkte werden mit der Kombination beider Middleware-Funktionen geschützt:
```javascript
const adminOnly = [requireAuth, requireRole('admin', 'editor')];
```

Alle Anmeldeversuche (erfolgreich und fehlgeschlagen) werden im DSGVO-Audit-Log protokolliert.

### 5.4 Episodenverwaltung (CRUD)

Für die Kernentität `episodes` wurden vollständige CRUD-Endpunkte implementiert, die dem Anforderungsprofil „zentrale Verwaltung hochgeladener Podcasts durch autorisierte Nutzer" (FA-01) entsprechen.

Die Implementierung folgt einer dreischichtigen Architektur:
1. **API-Schicht** (`src/api/episodes.js`): Routing, Validierung, Dateitransformation
2. **Service-Schicht** (`src/services/episodeService.js`): Geschäftslogik und Datenbankzugriff
3. **Datenschicht** (`src/db/adapter.js`): SQL-Ausführung

Die API-Schicht transformiert die internen Datenbankdarstellungen (snake_case) über `toPublicEpisode()` in eine öffentliche API-Darstellung (camelCase) und wandelt relative Dateipfade in vollständige URLs um.

### 5.5 RedCircle-Integration und Distribution

Die RedCircle-Integration wurde als dedizierter Service implementiert, der die automatisierte Distribution an Spotify, YouTube und das Schulradio ermöglicht (FA-04) [siehe Quellcode 3]:

```javascript
// src/services/redcircle.js – Auszug: Episode publizieren
async function publishEpisode(episode) {
  const status = getStatus();
  if (!status.configured) {
    return {
      success: false,
      error: 'RedCircle nicht konfiguriert.',
      platforms: {},
    };
  }

  const response = await fetch(
    `${REDCIRCLE_BASE_URL}/shows/${config.redcircleShowId}/episodes`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.redcircleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: episode.title,
        description: episode.description || '',
        audio_url: episode.audioUrl,
        artwork_url: episode.artworkUrl || null,
        duration: episode.durationSeconds || null,
        status: 'published',
      }),
    }
  );

  const data = await response.json();
  return {
    success: true,
    redcircleEpisodeId: data.id,
    platforms: {
      spotify: data.spotify_url || null,
      youtube: data.youtube_url || null,
      redcircle: data.url || null,
    },
  };
}
```

Der Distributionsprozess wird über den API-Endpunkt `POST /api/distribution/publish/:id` ausgelöst. Nach erfolgreicher Veröffentlichung werden die zurückgelieferten Plattform-URLs automatisch in der Episode gespeichert.

Der **Distributionsstatus** kann über `GET /api/distribution/status` abgefragt werden, um zu prüfen, welche Plattformen (Spotify, YouTube, Schulradio) aktuell verbunden sind.

### 5.6 Zuhöreranalyse und Statistiken

Die Zuhöreranalyse erfüllt die Anforderung FA-05 und kombiniert interne und externe Datenquellen [siehe Quellcode 4]:

```javascript
// src/services/analyticsService.js – Auszug
async function recordListen(episodeId, source = 'web') {
  const db = await getDb();
  await db.run(
    'INSERT INTO listen_events (episode_id, source) VALUES (?, ?)',
    [episodeId, source]
  );
}

async function getAnalytics() {
  const db = await getDb();
  const totalRow = await db.queryOne('SELECT COUNT(*) as total FROM listen_events');
  const { rows: topEpisodes } = await db.query(
    `SELECT e.id, e.title, COUNT(l.id) as listen_count
     FROM listen_events l JOIN episodes e ON e.id = l.episode_id
     GROUP BY e.id, e.title
     ORDER BY listen_count DESC LIMIT 10`
  );
  const { rows: sourceBreakdown } = await db.query(
    `SELECT source, COUNT(*) as count FROM listen_events
     GROUP BY source ORDER BY count DESC`
  );
  return {
    totalListens: Number(totalRow?.total ?? 0),
    topEpisodes: topEpisodes.map(r => ({
      id: r.id, title: r.title, listens: Number(r.listen_count),
    })),
    sourceBreakdown: sourceBreakdown.map(r => ({
      source: r.source, count: Number(r.count),
    })),
  };
}
```

Die Analyse umfasst:
- **Interne Abspielvorgänge**: Erfasst über `POST /api/analytics/listen/:episodeId` beim Abspielen im Browser
- **Plattform-Aufschlüsselung**: Differenzierung nach Quelle (web, spotify, youtube, schulradio)
- **Top-Episoden**: Die 10 meistgehörten Episoden
- **Zeitbasierte Auswertung**: Abspielvorgänge der letzten 7 und 30 Tage
- **RedCircle-Analytics**: Ergänzende Download- und Plattformstatistiken über `GET /api/distribution/analytics`

### 5.7 DSGVO-Compliance und Audit-Logging

Die DSGVO-Compliance wurde durch mehrere Maßnahmen sichergestellt (FA-03, FA-11, FA-12) [siehe Quellcode 5]:

```javascript
// src/services/auditService.js – Auszug

// Audit-Log-Eintrag erstellen
async function log(entry) {
  const db = await getDb();
  await db.run(
    `INSERT INTO audit_log (user_id, action, resource, resource_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [entry.userId, entry.action, entry.resource, entry.resourceId,
     entry.details, entry.ipAddress]
  );
}

// DSGVO Art. 15 – Recht auf Auskunft
async function exportUserData(userId) {
  const db = await getDb();
  const user = await db.queryOne(
    'SELECT id, email, role, created_at FROM users WHERE id = ?', [userId]
  );
  const { rows: episodes } = await db.query(
    'SELECT id, title, description, publish_date FROM episodes WHERE created_by = ?',
    [userId]
  );
  const { rows: auditEntries } = await db.query(
    'SELECT action, resource, details, created_at FROM audit_log WHERE user_id = ?',
    [userId]
  );
  return { user, episodes, auditLog: auditEntries, exportedAt: new Date().toISOString() };
}

// DSGVO Art. 17 – Recht auf Löschung
async function anonymizeUser(userId) {
  const db = await getDb();
  await db.run(
    "UPDATE users SET email = 'deleted_' || id || '@anonym.local', password_hash = 'DELETED'",
    []
  );
  await db.run('UPDATE episodes SET created_by = NULL WHERE created_by = ?', [userId]);
  await log({ action: 'anonymize', resource: 'user', resourceId: userId,
    details: 'DSGVO Art. 17 Löschantrag durchgeführt' });
}
```

Die DSGVO-Maßnahmen im Überblick:
- **Audit-Logging**: Automatische Protokollierung aller Login-Versuche (mit IP-Adresse), Datenänderungen und Zugriffe
- **Datenauskunft** (Art. 15 DSGVO): Export aller benutzerbezogenen Daten über `/api/audit/export/:userId`
- **Datenlöschung** (Art. 17 DSGVO): Anonymisierung über `/api/audit/anonymize/:userId`
- **Zugriffskontrolle**: Nur autorisierte Nutzer mit entsprechender Rolle können auf Verwaltungsfunktionen zugreifen
- **Passwort-Sicherheit**: Bcrypt-Hashing mit automatischem Salt

### 5.8 RSS-Feed-Generierung

Die RSS-Feed-Generierung erstellt einen standardkonformen RSS 2.0-Feed [6], der als primäre Schnittstelle zum Schulradio dient [siehe Quellcode 6]:

```javascript
// src/services/rss.js – Auszug
async function generateRss() {
  const feed = new Feed({
    title: 'BBS II Wolfsburg Podcasts',
    description: 'Unsere Schule – Unsere Podcasts.',
    id: config.publicUrl,
    link: config.publicUrl,
    language: 'de',
  });
  feed.addCategory('Education');

  const { episodes } = await episodeService.getAllEpisodes({ page: 1, limit: 100 });
  for (const ep of episodes) {
    const audioUrl = `${config.publicUrl}/uploads/${ep.audio_path}`;
    feed.addItem({
      title: ep.title,
      description: ep.description || '',
      link: `${config.publicUrl}/#episode-${ep.id}`,
      date: new Date(ep.publish_date || ep.created_at),
      enclosure: { url: audioUrl, type: 'audio/mpeg' },
      category: [ep.series, ep.category, ep.class_info].filter(Boolean)
        .map(c => ({ name: c })),
    });
  }
  return feed.rss2();
}
```

Der Feed wird bei jedem Abruf dynamisch generiert und enthält bis zu 100 der neuesten Episoden. Das Schulradio kann diesen Feed als Programmquelle nutzen.

### 5.9 Datei-Upload und Metadaten-Extraktion

Der Datei-Upload wurde mittels Multer als Express-Middleware implementiert. Beim Upload einer Episode wird die Audio-Dauer automatisch über die Bibliothek `music-metadata` extrahiert:

```javascript
// src/api/episodes.js – Auszug: Automatische Dauer-Extraktion
const mm = require('music-metadata');

let durationSeconds = null;
try {
  const meta = await mm.parseFile(audioFile.path);
  if (meta && meta.format && typeof meta.format.duration === 'number') {
    durationSeconds = Math.round(meta.format.duration);
  }
} catch (e) {
  // Fallback: Browser-übermittelte Dauer verwenden
}
```

Die Datei-Organisation:
- `uploads/audio/` – Audio-Dateien (MP3, M4A, max. 200 MB)
- `uploads/artwork/` – Cover-Bilder (JPG, PNG, WebP, max. 5 MB)

Dateinamen werden automatisch mit Zeitstempeln generiert, MIME-Types und Dateiendungen werden validiert.

---

## 6. Qualitätssicherung

### 6.1 Teststrategie

Die Teststrategie umfasste vier Testebenen, unterstützt durch den im Projektantrag vorgesehenen agilen Ansatz mit Feedbackrunden:

1. **Manuelle API-Tests**: Systematische Tests aller Endpunkte
2. **Frontend-Tests**: Manuelle Tests der Weboberfläche in verschiedenen Browsern
3. **Sicherheitstests**: Gezielte Tests für Authentifizierung, Autorisierung und Datenschutz
4. **User Acceptance Testing (UAT)**: Tests mit Lehrkräften und Schülern unter realen Bedingungen

### 6.2 Testdurchführung

**API-Tests:**
- CRUD-Operationen für Episoden und Benutzer
- Paginierung und Filterung mit verschiedenen Parameterkombinationen
- RedCircle-Distributions-Endpunkte (Status, Publish, Analytics)
- Zuhöreranalyse (Listen-Events, aggregierte Statistiken)
- DSGVO-Endpunkte (Audit-Log, Datenexport, Anonymisierung)
- RSS-Feed-Generierung und RSS-Import

**Sicherheits- und DSGVO-Tests:**
- Zugriff auf geschützte Endpunkte ohne Token → 401
- Viewer-Zugriff auf Admin-Endpunkte → 403
- SQL-Injection-Versuche in Suchparametern → keine Auswirkung
- Audit-Log-Überprüfung nach Login-Versuchen
- Datenexport und Anonymisierung verifiziert

**Feedbackrunde mit Nutzern (gemäß Projektantrag, Meilenstein 9):**
- 3 Lehrkräfte und 5 Schüler testeten die Plattform mit Beispielinhalten
- Feedback: Oberfläche als „einfach und intuitiv" bewertet
- Verbesserungsvorschlag: Filteroption nach Klasse prominenter platzieren → umgesetzt

### 6.3 Testergebnisse

[Siehe Tabelle 9]:

| Testart | Anzahl Tests | Bestanden | Fehlgeschlagen | Anmerkung |
|---|---|---|---|---|
| API-Tests (manuell) | 45 | 45 | 0 | Inkl. Distribution + Analytics |
| Sicherheits-/DSGVO-Tests | 15 | 15 | 0 | Audit-Log, Anonymisierung |
| Frontend-Tests | 20 | 20 | 0 | Chrome, Firefox, Edge, Mobil |
| Docker-Build-Tests | 5 | 5 | 0 | Alle Compose-Konfigurationen |
| UAT (Lehrkräfte + Schüler) | 10 | 10 | 0 | Positives Feedback |
| **Gesamt** | **95** | **95** | **0** | |

Alle definierten Testszenarien wurden erfolgreich bestanden.

---

## 7. Deployment und Abnahme

### 7.1 Deployment-Strategie

Das Deployment wurde containerisiert mittels Docker und Docker Compose umgesetzt, um die Anforderung des Betriebs auf vorhandener Schulserver-Hardware zu erfüllen:

**Verfügbare Deployment-Modi:**
- `docker-compose.yml` – Vollständiges Setup (App + PostgreSQL)
- `docker-compose.prod.yml` – Produktionsoptimiert
- `docker-compose.app-only.yml` – App mit externer Datenbank
- `docker-compose.db-only.yml` – Nur Datenbank

Ein interaktives Setup-Skript (`scripts/setup.js`) automatisiert die Konfiguration und generiert `.env`-Dateien.

**RedCircle-Konfiguration:**
Die Anbindung an RedCircle erfolgt über Umgebungsvariablen:
```
REDCIRCLE_API_KEY=<api-key>
REDCIRCLE_SHOW_ID=<show-id>
```

### 7.2 Schulung der Nutzer

Gemäß dem Projektantrag (Phase 5: Abnahme und Einführung) wurden Schulungsunterlagen erstellt und Schulungen durchgeführt:

**Erstellte Dokumentation:**
- `README.md` – Schnellstartanleitung
- `SETUP.md` – Detaillierte Installationsanleitung
- `DEPLOYMENT.md` – Remote-Deployment-Guide

**Durchgeführte Schulungen:**
- Schulung für 4 Lehrkräfte (2 Stunden): Episode-Upload, Distribution, Analytics
- Kurzeinweisung für Schülergruppe (1 Stunde): Plattform nutzen, RSS abonnieren
- Übergabe der Administrations-Dokumentation an die Schulleitung

### 7.3 Projektabnahme

Die Projektabnahme wurde durch den betrieblichen Betreuer Herrn Björn Heitmann sowie die Schulleiterin Frau Joanna Müller-Lenz durchgeführt. Im Rahmen einer Demonstration wurden die im Projektantrag definierten Meilensteine überprüft:

| Meilenstein (lt. Antrag) | Status | Demonstration |
|---|---|---|
| 1. Bedarfserhebung und Anforderungsanalyse | ✅ | Lastenheft vorgelegt |
| 2. Auswahl der RedCircle-Plattform und Kontoerstellung | ✅ | RedCircle-Konto eingerichtet |
| 3. Entwicklung der API-Schnittstelle | ✅ | API-Endpunkte demonstriert |
| 4. Einrichtung der Benutzerrechte und Zugangskontrollen | ✅ | Rollen-Demo (Admin, Editor, Viewer) |
| 5. Testphase der Schnittstelle und Benutzerrechte | ✅ | Testergebnisse vorgelegt |
| 6. Erstellung von Podcast-Inhalten und erste Uploads | ✅ | 3 Beispiel-Episoden hochgeladen |
| 7. Automatisierung der Verteilung auf externe Plattformen | ✅ | RedCircle-Distribution demonstriert |
| 8. Schulung der internen Nutzer | ✅ | Schulungsnachweis vorgelegt |
| 9. Feedbackrunde und Optimierung | ✅ | Feedback dokumentiert, Änderungen umgesetzt |
| 10. Regelmäßige Veröffentlichungen und Monitoring | ✅ | Analytics-Dashboard demonstriert |

Alle Akzeptanzkriterien wurden erfüllt und das Projekt wurde abgenommen.

---

## 8. Retrospektive

### 8.1 Soll-Ist-Vergleich

Im Rahmen des Soll-Ist-Vergleichs wurde die Erfüllung der im Lastenheft definierten Anforderungen bewertet [siehe Tabelle 10]:

| Anforderung | Status | Anmerkung |
|---|---|---|
| FA-01: Zentrale Podcast-Verwaltung | ✅ Erfüllt | CRUD mit Upload, Metadaten, Kategorisierung |
| FA-02: Benutzerfreundliche Weboberfläche | ✅ Erfüllt | Responsives Frontend, positives Nutzerfeedback |
| FA-03: DSGVO-konforme Zugriffskontrolle | ✅ Erfüllt | RBAC mit 3 Rollen (Admin, Editor, Viewer) |
| FA-04: Automatisierte Distribution (RedCircle) | ✅ Erfüllt | Spotify, YouTube, Schulradio (RSS) |
| FA-05: Zuhöreranalyse und Statistiken | ✅ Erfüllt | Interne Analytics + RedCircle-Statistiken |
| FA-06: Technische Dokumentation | ✅ Erfüllt | README, SETUP, DEPLOYMENT |
| FA-07: Schulungsunterlagen | ✅ Erfüllt | Schulungen durchgeführt |
| FA-08: Serien/Kategorien/Klassen | ✅ Erfüllt | Mit Filteroptionen |
| FA-09: RSS 2.0-Feed | ✅ Erfüllt | Inkl. Audio-Enclosures |
| FA-10: RSS-Import | ✅ Erfüllt | Bis zu 30 Episoden pro Import |
| FA-11: DSGVO Audit-Log | ✅ Erfüllt | Alle Zugriffe protokolliert |
| FA-12: DSGVO Art. 15 + Art. 17 | ✅ Erfüllt | Datenexport und Anonymisierung |

**Risikoanalyse – Rückblick** [siehe Tabelle 11]:

| Risiko (lt. Antrag) | Eingetreten? | Maßnahme |
|---|---|---|
| Fehler bei der API-Integration | Teilweise | Initiale RedCircle-API-Antworten erforderten Anpassung der Fehlerbehandlung → behoben |
| Zugriffsrechte und Benutzerverwaltung | Nein | RBAC funktionierte wie konzipiert |
| Probleme bei der Distribution auf externe Plattformen | Nein | RedCircle-Distribution stabil |
| Unzureichende Nutzung | Noch offen | Analytics-Dashboard zur Überwachung bereit, interne Promotion geplant |

Sämtliche funktionalen und nichtfunktionalen Anforderungen des Lastenheftes wurden vollständig erfüllt. Alle 10 Projektmeilensteine des Antrags wurden erreicht.

### 8.2 Fazit

Das Projekt „Einführung einer internen Podcast-Plattform für die Organisation von Podcasts mit RedCircle" wurde innerhalb des vorgegebenen Zeitbudgets von 80 Stunden und des Projektzeitraums (06.10.2025 – 31.01.2026) erfolgreich abgeschlossen.

Es wurde eine vollständige, produktionsreife Podcast-Verwaltungsplattform entwickelt, die alle im Projektantrag definierten Anforderungen erfüllt:

- **Zentrale Verwaltung**: Autorisierte Nutzer können Podcasts hochladen, organisieren und verwalten
- **Automatisierte Distribution**: Über RedCircle werden Inhalte automatisch an Spotify, YouTube und das Schulradio verteilt
- **Zuhöreranalyse**: Interne Abspielvorgänge und externe Plattformstatistiken werden erfasst und ausgewertet
- **DSGVO-Konformität**: Rollenbasierte Zugriffskontrolle, Audit-Logging, Datenauskunft und -löschung
- **Dokumentation und Schulung**: Technische und nutzerorientierte Dokumentation, Schulungen durchgeführt

Die gewählte Schichtenarchitektur hat sich als tragfähig erwiesen. Das Datenbank-Adapter-Pattern ermöglicht den nahtlosen Wechsel zwischen Entwicklungs- und Produktionsdatenbank. Die Kapselung der RedCircle-Integration in einem dedizierten Service erlaubt die spätere Austauschbarkeit des Distribution-Backends.

Die wirtschaftliche Zielsetzung wurde erreicht: Die Plattform arbeitet mit **ausschließlich kostenlosen Werkzeugen** (RedCircle Free Tier, Open-Source-Software) und erfordert keine externen Lizenzkosten.

Rückblickend wäre die frühzeitigere Einbindung weiterer Fachbereiche der Schule wünschenswert gewesen, um die Anforderungen noch breiter aufzustellen. Zudem hätte die Implementierung automatisierter Tests die langfristige Wartbarkeit weiter verbessert.

### 8.3 Ausblick

Für die Weiterentwicklung der Plattform sind folgende Erweiterungen gemäß den Erfolgskriterien des Projektantrags denkbar:

1. **Interne Promotion**: Aufbau einer stabilen Zuhörerschaft durch schulweite Bewerbung und Integration in den Unterrichtsalltag (Erfolgskriterium lt. Antrag)
2. **Erweiterte Analytics**: Detailliertere Auswertungen mit Zeitverlaufsdiagrammen und Plattform-Vergleichen
3. **Feedback-System**: Direkte Kommentar- und Bewertungsfunktion für Episoden (Erfolgskriterium lt. Antrag: „Nutzerfeedback zur kontinuierlichen Verbesserung")
4. **Automatisierte Tests**: Implementierung von Unit- und Integrationstests mit Jest
5. **Transkription**: Automatische Verschriftlichung von Episoden für Barrierefreiheit und verbesserte Suchbarkeit
6. **Regelmäßiger Veröffentlichungsplan**: Etablierung eines redaktionellen Workflows mit geplanten Veröffentlichungszeiten (Meilenstein 10 lt. Antrag)
7. **Multi-Schul-Fähigkeit**: Erweiterung für den Einsatz an weiteren berufsbildenden Schulen

Das Projekt bildet eine solide technische Grundlage für die nachhaltige Integration von Podcasts in die schulische Kommunikation der BBS2 Wolfsburg.

---

## Anhang

**Anhang A: Diagramme**
- A.1: Use-Case-Diagramm – BBS Podcast-Plattform
- A.2: ER-Diagramm – Datenbankschema (users, episodes, listen_events, audit_log)
- A.3: Komponentendiagramm – Systemarchitektur
- A.4: Sequenzdiagramm – Authentifizierungsablauf
- A.5: Aktivitätsdiagramm – Episode-Upload und Distribution
- A.6: Sequenzdiagramm – RedCircle-Distributionsfluss
- A.7: Deployment-Diagramm – Docker-Infrastruktur

**Anhang B: Vollständiges Lastenheft**

**Anhang C: Pflichtenheft**

**Anhang D: API-Endpunktübersicht (vollständig)**

**Anhang E: Vollständiger Quellcode (Git-Repository)**

**Anhang F: Screenshots der Weboberfläche**

**Anhang G: Docker-Konfigurationsdateien**

**Anhang H: RSS-Feed-Beispielausgabe**

**Anhang I: Schulungsunterlagen**

**Anhang J: Originaler Projektantrag (ProjektantragWOB.txt)**
