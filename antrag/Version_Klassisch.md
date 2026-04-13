# Projektdokumentation

## Skill Finder – Eine Datenbereitstellung für Personalverwaltung und -entwicklung

**Betriebliche Projektarbeit**
im Rahmen der Abschlussprüfung zum Fachinformatiker Anwendungsentwicklung

| | |
|---|---|
| **Auszubildender** | Juan |
| **Ausbildungsbetrieb** | Volkswagen Group Services GmbH, Standort Wolfsburg |
| **Betrieblicher Betreuer** | Björn Heitmann |
| **Durchführungszeitraum** | März – April 2026 |
| **Zeitbudget** | 80 Stunden |

---

## Eidesstattliche Erklärung

Hiermit wird versichert, dass die vorliegende Projektarbeit selbstständig und ohne unzulässige fremde Hilfe angefertigt wurde. Alle verwendeten Quellen und Hilfsmittel sind im Literaturverzeichnis vollständig angegeben. Die Arbeit wurde in gleicher oder ähnlicher Form noch keiner anderen Prüfungsbehörde vorgelegt.

Wolfsburg, den __________ 2026

___________________________
Juan

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
   4.4 Sicherheitskonzept
5. Implementierung
   5.1 Technologieauswahl
   5.2 Datenbankimplementierung
   5.3 Authentifizierung und Autorisierung
   5.4 CRUD-Endpunkte
   5.5 Suchalgorithmus
   5.6 DSGVO-Compliance
6. Qualitätssicherung
   6.1 Teststrategie
   6.2 Testdurchführung
   6.3 Testergebnisse
7. Deployment und Abnahme
   7.1 Deployment-Strategie
   7.2 Projektabnahme
8. Retrospektive
   8.1 Soll-Ist-Vergleich
   8.2 Fazit
   8.3 Ausblick

---

## Abbildungsverzeichnis

- Abbildung A.1: Use-Case-Diagramm – Skillfinder-System
- Abbildung A.2: ER-Diagramm – Datenbankschema
- Abbildung A.3: Komponentendiagramm – Systemarchitektur
- Abbildung A.4: Sequenzdiagramm – Authentifizierungsablauf
- Abbildung A.5: Aktivitätsdiagramm – Kompetenzsuche
- Abbildung A.6: Klassendiagramm – Domänenmodell
- Abbildung A.7: Deployment-Diagramm – AWS-Infrastruktur

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

## Codeverzeichnis

- Quellcode 1: SQLAlchemy-Modell – Employee
- Quellcode 2: RBAC-Filterung mit get_filtered_query()
- Quellcode 3: JWT-Token-Erzeugung
- Quellcode 4: Fernet-Verschlüsselung für Properties
- Quellcode 5: Gewichteter Suchalgorithmus
- Quellcode 6: Unit-Test – Mitarbeiterservice

## Abkürzungsverzeichnis

| Abkürzung | Bedeutung |
|---|---|
| API | Application Programming Interface |
| AWS | Amazon Web Services |
| CRUD | Create, Read, Update, Delete |
| DSGVO | Datenschutz-Grundverordnung |
| ER | Entity-Relationship |
| HTTP | Hypertext Transfer Protocol |
| IHK | Industrie- und Handelskammer |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| MCP | Model Context Protocol |
| OAuth | Open Authorization |
| ORM | Object-Relational Mapping |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SQL | Structured Query Language |
| TDD | Test-Driven Development |
| UAT | User Acceptance Testing |
| UML | Unified Modeling Language |
| UUID | Universally Unique Identifier |
| VW | Volkswagen |

## Literaturverzeichnis

[1] FastAPI Documentation. https://fastapi.tiangolo.com. Abgerufen am 15.03.2026.
[2] SQLAlchemy 2.0 Documentation. https://docs.sqlalchemy.org/en/20/. Abgerufen am 15.03.2026.
[3] PostgreSQL 16 Documentation. https://www.postgresql.org/docs/16/. Abgerufen am 15.03.2026.
[4] Europäisches Parlament (2016): Verordnung (EU) 2016/679 (DSGVO).
[5] RFC 7519 – JSON Web Token (JWT). https://tools.ietf.org/html/rfc7519.
[6] RFC 6749 – The OAuth 2.0 Authorization Framework.
[7] OWASP Foundation: OWASP Top Ten. https://owasp.org/www-project-top-ten/.
[8] Anthropic: Model Context Protocol Specification. https://spec.modelcontextprotocol.io.
[9] Gamma, E. et al. (1994): Design Patterns – Elements of Reusable Object-Oriented Software.
[10] Martin, R. C. (2009): Clean Code – A Handbook of Agile Software Craftsmanship.

---

## 1. Einleitung

### 1.1 Projektumfeld

Die vorliegende Projektarbeit wurde im Rahmen der Ausbildung zum Fachinformatiker der Fachrichtung Anwendungsentwicklung bei der Volkswagen Group Services GmbH (nachfolgend VWGS) am Standort Wolfsburg durchgeführt. Die VWGS ist ein konzerninternes Dienstleistungsunternehmen des Volkswagen-Konzerns und beschäftigt mehrere Tausend Mitarbeitende in verschiedenen Geschäftsbereichen, darunter IT-Services, Personaldienstleistungen und technische Beratung.

Das Projekt wurde innerhalb der IT-Abteilung realisiert, die für die Bereitstellung und den Betrieb interner Softwarelösungen verantwortlich ist. Die Betreuung erfolgte durch Herrn Björn Heitmann als betrieblichen Ausbilder, sowie Jan-Luca Lousee als Techniche Betreuung

### 1.2 Projektziel

Ziel des Projektes war die Entwicklung eines zentralen Datenbereitstellungsservices mit dem Namen „Skill Finder", der die Personalplanung und -entwicklung durch konsistente, strukturierte und systemübergreifend nutzbare Personaldaten unterstützt. Die Bereitstellung der Daten sollte über eine REST-API (Representational State Transfer – Application Programming Interface) erfolgen, die standardisierte HTTP-Methoden (GET, POST, PUT, DELETE) implementiert.

Darüber hinaus war eine optionale konzeptionelle Vorbereitung zur zukünftigen Anbindung eines Model Context Protocols (MCP) vorgesehen, sofern die hierfür erforderlichen unternehmensinternen Prozesse abgeschlossen sind. Die Umsetzung von KI-gestützten Funktionalitäten war ausdrücklich nicht Bestandteil des Projektes.

### 1.3 Projektbegründung

Die Personalplanung innerhalb der VWGS basierte zum Zeitpunkt der Projektinitiierung auf dezentralen, heterogenen Datenquellen. Relevante Informationen zu Mitarbeiterkompetenzen, Zertifizierungen und Qualifikationen wurden in unterschiedlichen Systemen und informellen Wissensspeichern vorgehalten. Daraus resultierten folgende Probleme:

- Hoher manueller Aufwand bei der Personal- und Einsatzplanung
- Erhöhte Fehleranfälligkeit durch inkonsistente oder veraltete Daten
- Geringe Transparenz über verfügbare Kompetenzen und Kapazitäten
- Erschwerte Vergleichbarkeit und Nachvollziehbarkeit von Planungsentscheidungen
- Abhängigkeit von informellem Wissen einzelner Mitarbeitender

Diese Situation führte zu einer ineffizienten Personalplanung, die den wachsenden organisatorischen und operativen Anforderungen nicht gerecht wurde. Das Projekt „Skill Finder" sollte diese Defizite durch eine zentrale, standardisierte Datenbasis beheben.

---

## 2. Projektplanung

### 2.1 Ist-Analyse

Im Rahmen der Ist-Analyse wurden Gespräche mit Vertretern der Personalabteilung (HR) sowie des Projektmanagements geführt. Es wurde festgestellt, dass die vorhandene Datenhaltung auf folgenden Systemen basierte:

- **Offizielle Systeme**: SAP-HR-Stammdaten, vereinzelte Excel-Übersichten
- **Inoffizielle Quellen**: Persönliche Notizen von Vorgesetzten, Abteilungs-Wikis, mündliche Weitergabe
- **Redundante Daten**: Gleiche Informationen in unterschiedlichen Formaten und Aktualisierungsständen

Es existierte kein zentrales System, das Kompetenzdaten strukturiert bereitstellte und gleichzeitig die Anforderungen der Datenschutz-Grundverordnung (DSGVO) erfüllte. Für die Suche nach Mitarbeitenden mit bestimmten Qualifikationen war ein erheblicher manueller Aufwand erforderlich, der im Durchschnitt 2–3 Stunden pro Suchanfrage betrug.

### 2.2 Soll-Konzept

Das Soll-Konzept sah die Entwicklung einer REST-API vor, die folgende Kernfunktionalitäten bereitstellt:

1. **CRUD-Operationen** für Mitarbeiter, Kompetenzen, Zertifizierungen und Eigenschaften
2. **Automatisierte Kompetenzsuche** mit gewichteter Bewertung und Kandidatenvorschlägen
3. **Aggregationsendpunkte** für Reports zur Kompetenzverteilung und Kompetenzlückenanalyse
4. **Rollenbasierte Zugriffskontrolle** (RBAC – Role-Based Access Control) mit fünf definierten Rollen
5. **DSGVO-konforme** Datenhaltung mit Audit-Logging, Verschlüsselung und Löschanträgen
6. **Vollständige API-Dokumentation** mittels OpenAPI/Swagger

Die Architektur wurde entkoppelt und erweiterbar konzipiert, sodass eine spätere Integration weiterer Systeme oder Protokolle ohne grundlegende Änderungen möglich ist.

### 2.3 Wirtschaftlichkeitsanalyse

Zur Bewertung der Wirtschaftlichkeit wurde eine Amortisationsrechnung durchgeführt. Grundlage waren die erhobenen Aufwände der manuellen Personalplanung sowie die erwarteten Einsparungen durch den Einsatz des Skill Finders.

**Kostenermittlung der Ist-Situation (pro Jahr):**

| Kostenfaktor | Berechnung | Betrag |
|---|---|---|
| Manuelle Kompetenzsuche (HR) | 15 Anfragen/Woche × 2,5 h × 52 Wochen × 45 €/h | 87.750 € |
| Fehlerhafte Personalzuordnung | 12 Fälle/Jahr × 8 h Korrekturaufwand × 55 €/h | 5.280 € |
| Doppelpflege von Daten | 3 HR-Mitarbeiter × 4 h/Woche × 52 Wochen × 45 €/h | 28.080 € |
| **Gesamtkosten Ist-Zustand** | | **121.110 €/Jahr** |

**Projektkosten (einmalig):**

| Kostenfaktor | Berechnung | Betrag |
|---|---|---|
| Personalkosten Entwicklung | 80 h × 25 €/h (Auszubildender) | 2.000 € |
| Betreuungsaufwand | 10 h × 65 €/h | 650 € |
| AWS-Infrastruktur (bestehend) | Anteilig, keine Neuanschaffung | 0 € |
| Testumgebung | Bereits vorhanden | 0 € |
| **Gesamtkosten Projekt** | | **2.650 €** |

**Laufende Kosten (pro Jahr):**

| Kostenfaktor | Betrag |
|---|---|
| AWS-Betriebskosten (anteilig) | 1.200 € |
| Wartung und Pflege (geschätzt) | 3.000 € |
| **Gesamtkosten laufend** | **4.200 €/Jahr** |

**Erwartete Einsparungen (pro Jahr):**

Durch den Einsatz des Skill Finders wurde eine Reduzierung des manuellen Aufwands um mindestens 60 % erwartet. Dies entspricht einer jährlichen Einsparung von ca. 72.666 €. Die Amortisation der Projektkosten erfolgt somit innerhalb von weniger als einem Monat.

**Amortisationszeit**: 2.650 € ÷ (72.666 € ÷ 12 Monate) ≈ **0,44 Monate**

Darüber hinaus wurden qualitative Nutzenpotenziale identifiziert, die nicht unmittelbar monetär bewertbar sind: erhöhte Transparenz, verbesserte Entscheidungsqualität und reduzierte Abhängigkeit von informellem Wissen.

### 2.4 Make-or-Buy-Analyse

Im Rahmen einer Make-or-Buy-Analyse wurden drei Alternativen bewertet [siehe Tabelle 4]:

| Kriterium (Gewichtung) | Eigenentwicklung | SAP SuccessFactors | Workday |
|---|---|---|---|
| Anpassbarkeit an VW-Prozesse (25 %) | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| DSGVO-Konformität (20 %) | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Integrierbarkeit in AWS-Infrastruktur (20 %) | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| Lizenzkosten (15 %) | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ |
| Implementierungszeit (10 %) | ★★★★☆ | ★★☆☆☆ | ★★☆☆☆ |
| Wartbarkeit durch internes Team (10 %) | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ |
| **Gesamtbewertung** | **4,75** | **2,85** | **2,25** |

Die Eigenentwicklung wurde als die wirtschaftlichste und strategisch sinnvollste Option bewertet. Kommerzielle Lösungen hätten jährliche Lizenzkosten von 50.000–120.000 € verursacht und wären nur eingeschränkt an die spezifischen Prozesse der VWGS anpassbar gewesen. Darüber hinaus hätte die Integration in die bestehende AWS-Infrastruktur einen erheblichen Mehraufwand erfordert.

### 2.5 Projektphasen und Zeitplanung

Das Projekt wurde in fünf Phasen mit einem Gesamtbudget von 80 Stunden geplant [siehe Tabelle 1]:

| Phase | Aufgaben | Geplant | Tatsächlich |
|---|---|---|---|
| **1. Analyse** | Anforderungsgespräche, Ist-Analyse, Wirtschaftlichkeitsanalyse, Use-Cases, Lastenheft | 6 h | 7 h |
| **2. Entwurf** | DB-Schema, API-Architektur, OpenAPI-Spezifikation, RBAC-Konzept, Sicherheitskonzept, MCP-Konzept | 8 h | 9 h |
| **3. Implementierung** | Datenbank, Backend-API, Authentifizierung, CRUD, Suche, Reports, Validierung, Tests | 50 h | 48 h |
| **4. Testing & Deployment** | Unit-/Integrationstests, Sicherheitstests, Load-Tests, UAT, Deployment | 8 h | 9 h |
| **5. Dokumentation** | API-Dokumentation, technische Dokumentation, Benutzerhandbuch, Deployment-Guide | 8 h | 7 h |
| **Gesamt** | | **80 h** | **80 h** |

Das Projekt wurde agil mit iterativen Entwicklungszyklen durchgeführt. Zur Sicherstellung der Codequalität wurde Test-Driven Development (TDD) eingesetzt. Die Versionsverwaltung erfolgte über Git mit kontinuierlicher technischer Dokumentation.

### 2.6 Ressourcenplanung

Folgende Ressourcen standen für die Projektdurchführung zur Verfügung [siehe Tabelle 2]:

| Ressource | Beschreibung |
|---|---|
| Hardware | Entwicklungsrechner (Windows 11, 16 GB RAM) |
| Betriebssystem | Windows 11 Enterprise |
| Programmiersprache | Python 3.12 |
| Framework | FastAPI 0.115 |
| Datenbank | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 |
| Versionsverwaltung | Git |
| Cloud-Infrastruktur | AWS (bestehend) |
| IDE | Visual Studio Code |
| Testframework | pytest 8.3 |
| API-Dokumentation | OpenAPI 3.0 / Swagger UI |

### 2.7 Entwicklungsmethodik

Die Entwicklung erfolgte nach agilen Prinzipien in iterativen Zyklen. Für jede Funktionseinheit wurde zunächst ein Test geschrieben (TDD), anschließend die Implementierung durchgeführt und abschließend eine Qualitätsprüfung vorgenommen.

**Einsatz KI-gestützter Entwicklungswerkzeuge:**

Zur Unterstützung des Entwicklungsprozesses wurde ein KI-gestütztes Entwicklungswerkzeug eingesetzt. Der Einsatz erfolgte ausschließlich werkzeugunterstützend und ist vergleichbar mit etablierten Entwicklungswerkzeugen wie IDE-Autovervollständigung oder statischer Codeanalyse. Die Nutzung umfasste insbesondere:

- Unterstützung bei der Formulierung und Überprüfung technischer Lösungsansätze
- Generierung von Code-Vorschlägen für klar abgegrenzte Teilaufgaben
- Unterstützung bei der Analyse von Fehlermeldungen und Optimierungsvorschlägen

Die fachliche Konzeption, Architekturentscheidungen, sicherheitsrelevanten Bewertungen, Implementierung der Geschäftslogik sowie die finale Auswahl, Anpassung und Integration des Quellcodes erfolgten ausschließlich durch den Projektbearbeiter. KI-generierte Inhalte wurden transparent geprüft, angepasst und in die Gesamtarchitektur integriert. Der eigenständig erbrachte Projektanteil beträgt in allen Projektphasen deutlich mehr als 50 %.

---

## 3. Analysephase

### 3.1 Anforderungsanalyse

Die Anforderungsanalyse wurde auf Basis der Ist-Analyse sowie der Gespräche mit den Stakeholdern durchgeführt. Es wurden sowohl funktionale als auch nichtfunktionale Anforderungen erhoben und in einem Lastenheft dokumentiert.

Die Anforderungen wurden in folgende Kategorien unterteilt:

1. **Datenverwaltung**: CRUD-Operationen für alle Kernentitäten
2. **Suche und Reporting**: Automatisierte Kompetenzsuche und Aggregationsberichte
3. **Sicherheit**: Authentifizierung, Autorisierung, Eingabevalidierung
4. **Datenschutz**: DSGVO-konforme Verarbeitung und Protokollierung
5. **Dokumentation**: Vollständige API-Dokumentation

Zur Visualisierung der funktionalen Anforderungen wurde ein Use-Case-Diagramm erstellt [siehe Abbildung A.1], das die Interaktionen der fünf Benutzerrollen mit dem System darstellt.

### 3.2 Lastenheft (Auszug)

Das Lastenheft wurde in Zusammenarbeit mit der Personalabteilung erstellt. Nachfolgend werden die wesentlichen funktionalen Anforderungen aufgeführt [siehe Tabelle 5]:

| ID | Anforderung | Priorität | Kategorie |
|---|---|---|---|
| FA-01 | Das System muss CRUD-Operationen für Mitarbeiterdaten bereitstellen. | Muss | Datenverwaltung |
| FA-02 | Das System muss CRUD-Operationen für Kompetenzen und Zertifizierungen ermöglichen. | Muss | Datenverwaltung |
| FA-03 | Das System muss eine gewichtete Kompetenzsuche mit Kandidatenvorschlägen bereitstellen. | Muss | Suche |
| FA-04 | Das System muss Aggregationsberichte zur Kompetenzverteilung generieren. | Muss | Reporting |
| FA-05 | Das System muss eine rollenbasierte Zugriffskontrolle mit fünf Rollen implementieren. | Muss | Sicherheit |
| FA-06 | Das System muss Authentifizierung mittels JWT und OAuth 2.0 bereitstellen. | Muss | Sicherheit |
| FA-07 | Das System muss alle Datenzugriffe in einem unveränderlichen Audit-Log protokollieren. | Muss | Datenschutz |
| FA-08 | Das System muss Löschanträge gemäß Art. 17 DSGVO verarbeiten können. | Muss | Datenschutz |
| FA-09 | Das System muss sensible Eigenschaften verschlüsselt speichern. | Muss | Sicherheit |
| FA-10 | Das System muss eine vollständige API-Dokumentation im OpenAPI-Format bereitstellen. | Muss | Dokumentation |

**Nichtfunktionale Anforderungen** [siehe Tabelle 6]:

| ID | Anforderung | Kategorie |
|---|---|---|
| NFA-01 | Die API muss Antwortzeiten unter 500 ms für Standardanfragen gewährleisten. | Performance |
| NFA-02 | Die API muss gegen SQL-Injection und XSS-Angriffe geschützt sein. | Sicherheit |
| NFA-03 | Das System muss in der bestehenden AWS-Infrastruktur betreibbar sein. | Betrieb |
| NFA-04 | Der Quellcode muss den teaminternen Coding-Standards entsprechen. | Wartbarkeit |
| NFA-05 | Die Testabdeckung muss mindestens 80 % betragen. | Qualität |

### 3.3 Pflichtenheft (Auszug)

Auf Grundlage des Lastenheftes wurde ein Pflichtenheft erstellt, das die technische Umsetzung der Anforderungen spezifiziert. Nachfolgend ein Auszug:

**Zu FA-05 – Rollenbasierte Zugriffskontrolle:**

Es wurden fünf Rollen mit hierarchischen Zugriffsbereichen (Scopes) definiert [siehe Tabelle 7]:

| Rolle | Scope | Beschreibung |
|---|---|---|
| EMPLOYEE | OWN | Zugriff ausschließlich auf eigene Daten |
| VORGESETZTER | SUPERVISED | Zugriff auf Daten direkt unterstellter Mitarbeitender |
| HR_DEPARTMENT | DEPARTMENT | Zugriff auf alle Mitarbeitenden der eigenen Abteilung |
| HR_ADMIN | ALL | Vollzugriff auf alle Daten und Verwaltungsfunktionen |
| DPO | ALL (nur lesend) | Lesezugriff auf alle Daten für Datenschutz-Audits |

Die Scope-Filterung wird auf Service-Ebene durch eine zentrale Hilfsfunktion (`get_filtered_query()`) durchgesetzt, die automatisch die zugriffsbeschränkenden WHERE-Bedingungen in Datenbankabfragen einfügt.

**Zu FA-03 – Gewichtete Kompetenzsuche:**

Die Suche akzeptiert eine Liste gewünschter Kompetenzen mit optionalen Gewichtungen als Eingabe. Für jeden Mitarbeitenden wird ein Fit-Score (0–100 %) berechnet, der die Übereinstimmung zwischen geforderten und vorhandenen Kompetenzen unter Berücksichtigung der Kompetenzstufen (Beginner, Intermediate, Advanced, Expert) abbildet. Das Ergebnis wird als sortierte Kandidatenliste zurückgegeben.

### 3.4 Use-Case-Analyse

Es wurden sechs primäre Use Cases identifiziert [siehe Abbildung A.1]:

1. **UC-01**: Mitarbeiterdaten verwalten (HR_ADMIN, HR_DEPARTMENT)
2. **UC-02**: Kompetenzen zuweisen und bewerten (VORGESETZTER, HR_DEPARTMENT)
3. **UC-03**: Kompetenzsuche durchführen (alle Rollen, scope-gefiltert)
4. **UC-04**: Reports generieren (HR_DEPARTMENT, HR_ADMIN, DPO)
5. **UC-05**: Eigene Daten einsehen (EMPLOYEE)
6. **UC-06**: Datenschutz-Audit durchführen (DPO)

Für den Use Case UC-03 wurde ein Aktivitätsdiagramm erstellt [siehe Abbildung A.5], das den Ablauf von der Eingabe der Suchparameter über die gewichtete Bewertung bis zur Ausgabe der Ergebnisliste darstellt.

---

## 4. Entwurfsphase

### 4.1 Systemarchitektur

Die Systemarchitektur wurde als Schichtenarchitektur (Layered Architecture) mit drei Ebenen konzipiert [siehe Abbildung A.3]:

1. **API-Schicht** (`app/api/v1/`): Entgegennahme und Validierung von HTTP-Anfragen, Formatierung der Antworten. Die Eingabevalidierung erfolgt mittels Pydantic-Schemata.
2. **Service-Schicht** (`app/services/`): Implementierung der Geschäftslogik, Durchsetzung der RBAC-Berechtigungen, Transaktionsmanagement.
3. **Datenschicht** (`app/models/`): Datenbankmodelle, Beziehungen und Abfragen mittels SQLAlchemy ORM (Object-Relational Mapping).

Diese Architektur gewährleistet eine klare Trennung der Verantwortlichkeiten (Separation of Concerns) und ermöglicht die unabhängige Testbarkeit jeder Schicht. Abhängigkeiten verlaufen ausschließlich von oben nach unten.

### 4.2 Datenbankmodell

Das Datenbankschema umfasst elf Tabellen, die in drei Gruppen unterteilt sind [siehe Abbildung A.2]:

**Kernentitäten:**
- `departments`: Hierarchische Abteilungsstruktur mit Selbstreferenz (`parent_department_id`)
- `employees`: Mitarbeiterstammdaten mit Selbstreferenz für Vorgesetztenbeziehung (`supervisor_id`)
- `skills`: Kompetenzkatalog
- `employee_skills`: Verknüpfungstabelle mit Kompetenzstufe und Bewertung
- `certifications`: Zertifizierungen mit Ablaufdatum
- `properties`: Verschlüsselte Schlüssel-Wert-Paare für sensible Eigenschaften

**Authentifizierung und Autorisierung:**
- `users`: Systembenutzer mit Rollenzuweisung
- `roles`: Fünf vordefinierte Rollen
- `permissions`: Rollenspezifische Berechtigungen

**DSGVO-Compliance:**
- `audit_logs`: Unveränderliches Protokoll aller Datenzugriffe
- `deletion_requests`: DSGVO-Löschanträge gemäß Art. 17

Sämtliche Primärschlüssel wurden als UUID (Universally Unique Identifier) realisiert. Alle Tabellen verfügen über Zeitstempel (`created_at`, `updated_at`) sowie über logische Löschkennzeichen (`is_active`).

### 4.3 API-Design

Die API wurde nach RESTful-Prinzipien entworfen und umfasst folgende Endpunktgruppen [siehe Tabelle 8]:

| Ressource | Pfad | Methoden | Beschreibung |
|---|---|---|---|
| Authentifizierung | `/api/v1/auth` | POST | Login, Token-Refresh |
| Mitarbeiter | `/api/v1/employees` | GET, POST, PUT, DELETE | CRUD für Mitarbeiterdaten |
| Kompetenzen | `/api/v1/skills` | GET, POST, PUT, DELETE | Kompetenzkatalog und -zuweisungen |
| Zertifizierungen | `/api/v1/certifications` | GET, POST, PUT, DELETE | Zertifizierungsverwaltung |
| Eigenschaften | `/api/v1/properties` | GET, POST, PUT, DELETE | Verschlüsselte Eigenschaften |
| Abteilungen | `/api/v1/departments` | GET, POST, PUT, DELETE | Abteilungshierarchie |
| Suche | `/api/v1/search` | POST | Gewichtete Kompetenzsuche |
| Reports | `/api/v1/reports` | GET | Aggregationsberichte |
| Benutzer | `/api/v1/users` | GET, POST, PUT, DELETE | Benutzerverwaltung |
| Rollen | `/api/v1/roles` | GET | Rollendefinitionen |

Alle Endpunkte liefern Antworten im JSON-Format (JavaScript Object Notation) und verwenden standardisierte HTTP-Statuscodes.

### 4.4 Sicherheitskonzept

Das Sicherheitskonzept wurde mehrstufig konzipiert:

1. **Authentifizierung**: JWT-basiert (JSON Web Token) mit Access-Tokens (30 Minuten Gültigkeit) und Refresh-Tokens (7 Tage Gültigkeit). Die Signierung erfolgt mit dem HS256-Algorithmus.
2. **Autorisierung**: RBAC mit fünf Rollen und Scope-basierter Filterung auf Service-Ebene.
3. **Eingabevalidierung**: Serverseitige Validierung aller Eingaben mittels Pydantic, einschließlich E-Mail-Validierung, UUID-Validierung und Enum-Prüfung.
4. **Verschlüsselung**: Alle sensiblen Properties werden mit Fernet-Verschlüsselung (symmetrisch, AES-128-CBC) gespeichert.
5. **Audit-Logging**: Automatische Protokollierung aller API-Zugriffe durch eine Middleware-Komponente in einer unveränderlichen Audit-Log-Tabelle.
6. **Rate Limiting**: Begrenzung der Anfragerate pro Benutzer zum Schutz vor Brute-Force-Angriffen.

---

## 5. Implementierung

### 5.1 Technologieauswahl

Die Auswahl der eingesetzten Technologien erfolgte auf Basis der Unternehmensrichtlinien und der fachlichen Anforderungen:

- **Python 3.12**: Gemäß teaminternen Coding-Standards der VWGS
- **FastAPI 0.115**: Modernes, asynchrones Web-Framework mit integrierter OpenAPI-Dokumentation [1]
- **SQLAlchemy 2.0**: ORM mit nativer Async-Unterstützung für typsichere Datenbankoperationen [2]
- **PostgreSQL 16**: Relationale Datenbank mit Unterstützung für UUID-Typen und Row-Level Security [3]
- **Pydantic 2.9**: Datenvalidierung und Serialisierung für Eingabe-/Ausgabeschemata
- **pytest 8.3**: Testframework für Unit- und Integrationstests

Die Auswahl von FastAPI gegenüber Django REST Framework wurde mit der nativen Async-Unterstützung, der automatischen OpenAPI-Generierung und der höheren Performance bei vergleichbarer Entwicklungsgeschwindigkeit begründet.

### 5.2 Datenbankimplementierung

Die Datenbankmodelle wurden mittels SQLAlchemy ORM als Python-Klassen definiert. Nachfolgend ein Beispiel des Employee-Modells [siehe Quellcode 1]:

```python
class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    employee_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    department_id = Column(UUID, ForeignKey("departments.id"))
    supervisor_id = Column(UUID, ForeignKey("employees.id"))
    hired_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Beziehungen
    department = relationship("Department", back_populates="employees")
    supervisor = relationship("Employee", remote_side=[id])
    skills = relationship("EmployeeSkill", back_populates="employee")
    certifications = relationship("Certification", back_populates="employee")
```

Besonders hervorzuheben ist die Selbstreferenz des Feldes `supervisor_id`, die die hierarchische Vorgesetztenstruktur abbildet und als Grundlage für die RBAC-Scope-Filterung der Rolle VORGESETZTER dient.

Die Datenbankmigration wurde mittels Alembic verwaltet, wodurch eine reproduzierbare Schemaevolution gewährleistet wird.

### 5.3 Authentifizierung und Autorisierung

Die Authentifizierung wurde als JWT-basiertes System mit Access- und Refresh-Tokens implementiert. Die Token-Erzeugung erfolgt in einem dedizierten Service [siehe Quellcode 3]:

```python
async def create_access_token(user_id: UUID, role: str) -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        ),
        "type": "access"
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")
```

Die Autorisierung wird auf Service-Ebene durch die zentrale Funktion `get_filtered_query()` durchgesetzt [siehe Quellcode 2]:

```python
def get_filtered_query(query, model, current_user, resource_type, action):
    role = current_user.role.name

    if role == "EMPLOYEE":
        query = query.where(model.id == current_user.employee_id)
    elif role == "VORGESETZTER":
        query = query.where(model.supervisor_id == current_user.employee_id)
    elif role == "HR_DEPARTMENT":
        query = query.where(model.department_id == current_user.department_id)
    # HR_ADMIN und DPO: keine zusätzliche Filterung

    return query
```

Dieses Muster stellt sicher, dass die Zugriffskontrolle konsistent und zentral in allen Services angewendet wird. Eine direkte Umgehung der RBAC-Filterung ist durch die Architektur ausgeschlossen.

### 5.4 CRUD-Endpunkte

Für jede Kernentität wurden vollständige CRUD-Endpunkte implementiert. Die Implementierung folgt einem einheitlichen Muster:

1. **API-Schicht**: Empfang der Anfrage, Validierung durch Pydantic-Schema, Weiterleitung an Service
2. **Service-Schicht**: Anwendung der RBAC-Filterung, Ausführung der Geschäftslogik, Transaktionsmanagement
3. **Datenschicht**: Datenbankabfrage via SQLAlchemy ORM

Sämtliche Datenbankoperationen wurden asynchron implementiert (`async/await`), um eine optimale Ressourcennutzung bei gleichzeitigen Anfragen zu gewährleisten.

### 5.5 Suchalgorithmus

Der gewichtete Suchalgorithmus stellt eine Kernfunktionalität des Systems dar [siehe Quellcode 5, Abbildung A.5]. Die Implementierung erfolgt in folgenden Schritten:

1. **Eingabe**: Liste der gewünschten Kompetenzen mit optionaler Gewichtung (1–5)
2. **Normalisierung**: Die Gewichtungen werden auf einen gemeinsamen Bereich normiert
3. **Abgleich**: Für jeden Mitarbeitenden wird der Überlappungsgrad der vorhandenen mit den gesuchten Kompetenzen ermittelt
4. **Bewertung**: Unter Berücksichtigung der Kompetenzstufen (Beginner=1, Intermediate=2, Advanced=3, Expert=4) und der Gewichtungen wird ein Fit-Score berechnet
5. **Sortierung**: Die Ergebnisse werden absteigend nach Fit-Score sortiert und als Liste zurückgegeben

```python
async def search_employees_by_skills(required_skills, current_user, db):
    query = select(Employee).where(Employee.is_active == True)
    query = get_filtered_query(query, Employee, current_user, "employee", "read")
    employees = (await db.execute(query)).scalars().all()

    results = []
    for employee in employees:
        score = calculate_fit_score(employee.skills, required_skills)
        if score > 0:
            results.append({"employee": employee, "fit_score": score})

    return sorted(results, key=lambda x: x["fit_score"], reverse=True)
```

Die RBAC-Filterung wird auch bei der Suche konsequent angewendet, sodass jeder Benutzer ausschließlich Ergebnisse innerhalb seines Zugriffsbereichs erhält.

### 5.6 DSGVO-Compliance

Die DSGVO-Compliance wurde durch mehrere Maßnahmen sichergestellt:

**Audit-Logging**: Eine Middleware-Komponente protokolliert automatisch jeden API-Zugriff in der Tabelle `audit_logs`. Diese Tabelle ist durch PostgreSQL-Regeln vor Manipulation geschützt (kein UPDATE oder DELETE möglich).

**Verschlüsselung sensibler Daten** [siehe Quellcode 4]:

```python
from cryptography.fernet import Fernet

async def encrypt_value(plaintext: str) -> str:
    fernet = Fernet(settings.fernet_key.encode())
    return fernet.encrypt(plaintext.encode()).decode()

async def decrypt_value(encrypted: str) -> str:
    fernet = Fernet(settings.fernet_key.encode())
    return fernet.decrypt(encrypted.encode()).decode()
```

Alle in der Tabelle `properties` gespeicherten Werte werden mit dieser Fernet-Verschlüsselung geschützt. Der Verschlüsselungsschlüssel wird als Umgebungsvariable bereitgestellt und ist nicht im Quellcode enthalten.

**Recht auf Auskunft (Art. 15 DSGVO)**: Ein dedizierter Endpunkt ermöglicht den Export aller zu einer Person gespeicherten Daten.

**Recht auf Löschung (Art. 17 DSGVO)**: Über die Tabelle `deletion_requests` können Löschanträge gestellt werden, die einem definierten Genehmigungsprozess folgen.

---

## 6. Qualitätssicherung

### 6.1 Teststrategie

Die Teststrategie umfasste drei Testebenen:

1. **Unit-Tests**: Isolierte Tests einzelner Service-Funktionen mit gemockten Abhängigkeiten
2. **Integrationstests**: End-to-End-Tests der API-Endpunkte mit einer Testdatenbank
3. **Sicherheitstests**: Spezifische Tests für SQL-Injection, XSS und Authentifizierungsumgehung

Die Tests wurden mittels pytest durchgeführt und kontinuierlich während der Entwicklung ausgeführt (TDD-Ansatz).

### 6.2 Testdurchführung

Nachfolgend ein Beispiel eines Unit-Tests für den Mitarbeiterservice [siehe Quellcode 6]:

```python
@pytest.mark.asyncio
async def test_get_employee_by_id(mock_db, test_employee):
    """Testet die Abfrage eines Mitarbeiters anhand seiner ID."""
    mock_db.execute.return_value.scalar_one_or_none.return_value = test_employee

    result = await employee_service.get_employee(
        employee_id=test_employee.id,
        db=mock_db,
        current_user=test_admin_user
    )

    assert result is not None
    assert result.id == test_employee.id
    assert result.name == test_employee.name
```

Integrationstests wurden mit dem httpx-Testclient durchgeführt, der asynchrone Anfragen an die FastAPI-Anwendung simuliert:

```python
@pytest.mark.asyncio
async def test_create_employee_as_hr_admin(client, admin_token):
    """Integrationstests: HR_ADMIN kann Mitarbeiter anlegen."""
    response = await client.post(
        "/api/v1/employees",
        json={"name": "Max Mustermann", "email": "m.mustermann@vwgs.com"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Max Mustermann"
```

### 6.3 Testergebnisse

Die Testdurchführung ergab folgende Ergebnisse [siehe Tabelle 9]:

| Testart | Anzahl Tests | Bestanden | Fehlgeschlagen | Abdeckung |
|---|---|---|---|---|
| Unit-Tests | 45 | 45 | 0 | 85 % |
| Integrationstests | 28 | 28 | 0 | 78 % |
| Sicherheitstests | 12 | 12 | 0 | 100 % (sicherheitskritischer Code) |
| **Gesamt** | **85** | **85** | **0** | **82 %** |

Die angestrebte Testabdeckung von mindestens 80 % wurde erreicht. Sicherheitskritischer Code (Authentifizierung, RBAC, Verschlüsselung) wurde vollständig getestet.

---

## 7. Deployment und Abnahme

### 7.1 Deployment-Strategie

Das Deployment wurde für die bestehende AWS-Infrastruktur der VWGS konzipiert. Die Anwendung wurde als Docker-Container paketiert und für den Betrieb auf AWS EKS (Elastic Kubernetes Service) vorbereitet. Die Datenbank wird über AWS RDS (Relational Database Service) mit PostgreSQL 16 bereitgestellt.

Die Konfiguration erfolgt ausschließlich über Umgebungsvariablen, wodurch eine saubere Trennung von Code und Konfiguration gemäß der Twelve-Factor-App-Methodik gewährleistet wird.

### 7.2 Projektabnahme

Die Projektabnahme wurde durch den betrieblichen Betreuer Herrn Björn Heitmann sowie Vertreter der Personalabteilung durchgeführt. Im Rahmen eines User Acceptance Tests (UAT) wurden folgende Szenarien erfolgreich demonstriert:

1. Anmeldung mit verschiedenen Rollen und Überprüfung der Zugriffsbeschränkungen
2. Erstellung und Verwaltung von Mitarbeiterdaten mit Kompetenzen und Zertifizierungen
3. Durchführung einer Kompetenzsuche mit gewichteten Kriterien
4. Generierung eines Kompetenzverteilungsberichts
5. Nachweis der Audit-Logging-Funktionalität
6. Nachweis der Verschlüsselung sensibler Properties

Alle Akzeptanzkriterien wurden erfüllt und das Projekt wurde abgenommen.

---

## 8. Retrospektive

### 8.1 Soll-Ist-Vergleich

Im Rahmen des Soll-Ist-Vergleichs wurde die Erfüllung der im Lastenheft definierten Anforderungen bewertet [siehe Tabelle 10]:

| Anforderung | Status | Anmerkung |
|---|---|---|
| FA-01: CRUD Mitarbeiter | ✅ Erfüllt | Vollständig implementiert |
| FA-02: CRUD Kompetenzen/Zertifizierungen | ✅ Erfüllt | Vollständig implementiert |
| FA-03: Gewichtete Kompetenzsuche | ✅ Erfüllt | Mit Fit-Score-Berechnung |
| FA-04: Aggregationsberichte | ✅ Erfüllt | Kompetenzverteilung und -lücken |
| FA-05: RBAC mit 5 Rollen | ✅ Erfüllt | Scope-basierte Filterung |
| FA-06: JWT + OAuth 2.0 | ✅ Erfüllt | Access- und Refresh-Tokens |
| FA-07: Audit-Logging | ✅ Erfüllt | Unveränderliche Protokollierung |
| FA-08: DSGVO-Löschanträge | ✅ Erfüllt | Art. 17 Workflow |
| FA-09: Verschlüsselung | ✅ Erfüllt | Fernet-Verschlüsselung |
| FA-10: API-Dokumentation | ✅ Erfüllt | OpenAPI/Swagger |
| MCP-Vorbereitung | ✅ Konzeptionell | Schema und Spezifikation dokumentiert |

Sämtliche funktionalen Anforderungen des Lastenheftes wurden vollständig erfüllt. Die MCP-Anbindung wurde gemäß Projektantrag ausschließlich konzeptionell vorbereitet, da die erforderlichen unternehmensinternen Prozesse zum Zeitpunkt der Durchführung noch nicht abgeschlossen waren.

### 8.2 Fazit

Das Projekt „Skill Finder" wurde innerhalb des vorgegebenen Zeitbudgets von 80 Stunden erfolgreich abgeschlossen. Es wurde eine zentrale, DSGVO-konforme REST-API zur Bereitstellung von Personaldaten entwickelt, die den definierten Anforderungen vollständig entspricht.

Die gewählte Schichtenarchitektur hat sich als tragfähig erwiesen und ermöglicht eine wartbare, erweiterbare Codebasis. Die konsequente Anwendung von RBAC auf Service-Ebene stellt sicher, dass Zugriffsbeschränkungen systemweit konsistent durchgesetzt werden. Die Teststrategie mit über 80 % Abdeckung bietet ein angemessenes Qualitätsniveau.

Rückblickend wäre eine frühzeitigere Einbindung der Endanwender in den Entwicklungsprozess wünschenswert gewesen, um Anforderungen noch präziser zu erfassen. Zudem hätte die Implementierung von Load-Tests zu einem früheren Zeitpunkt eventuell zu einer früheren Identifikation von Performance-Engpässen geführt.

### 8.3 Ausblick

Für die Weiterentwicklung des Skill Finders sind folgende Erweiterungen denkbar:

1. **MCP-Integration**: Sobald die unternehmensinternen Prozesse abgeschlossen sind, kann die konzeptionell vorbereitete MCP-Anbindung implementiert werden. Dies würde eine direkte Integration in KI-gestützte Analyse- und Entscheidungsunterstützungssysteme ermöglichen.
2. **Erweiterte Suchfunktionalität**: Integration von Volltextsuche und Fuzzy-Matching für eine verbesserte Trefferqualität.
3. **Benachrichtigungssystem**: Automatische Benachrichtigungen bei ablaufenden Zertifizierungen oder neuen Kompetenzzuweisungen.
4. **Anbindung an SAP-HR**: Integration mit bestehenden SAP-HR-Stammdaten zur automatischen Synchronisation von Mitarbeiterdaten.
5. **Performance-Optimierung**: Einführung einer Caching-Schicht für häufig abgefragte Daten.


Das Projekt bildet eine solide technische Grundlage für die weitere Digitalisierung der Personalplanungsprozesse innerhalb der Volkswagen Group Services.

---

## Anhang

**Anhang A: Diagramme**
- A.1: Use-Case-Diagramm
- A.2: ER-Diagramm
- A.3: Komponentendiagramm
- A.4: Sequenzdiagramm – Authentifizierung
- A.5: Aktivitätsdiagramm – Kompetenzsuche
- A.6: Klassendiagramm
- A.7: Deployment-Diagramm

**Anhang B: Vollständiges Lastenheft**

**Anhang C: Pflichtenheft**

**Anhang D: API-Endpunktübersicht (OpenAPI-Spezifikation)**

**Anhang E: Vollständiger Quellcode (Git-Repository)**

**Anhang F: Testergebnisse und Coverage-Report**
