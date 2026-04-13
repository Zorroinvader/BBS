ANTRAG FÜR DIE BETRIEBLICHE PROJEKTARBEIT
1. Projektbezeichnung
Skill Finder – Eine Datenbereitstellung für Personalverwaltung und -entwicklung

Kurzform der Aufgabenstellung
Zur Optimierung der Personalplanung soll ein Service entwickelt werden, der 
verschiedene Personalprozesse unterstützt, Personaldaten zentral bereitstellt und eine 
spätere konzeptionelle Nutzung durch eine KI-Anbindung ermöglicht.
1.2 Ist-Analyse
Die Volkswagen Group Services beschäftigt mehrere Tausend Mitarbeiter. Diese 
Mitarbeiter tragen unterschiedlichste arbeitsrelevante Eigenschaften zu verschiedenen 
Betriebstätigkeiten bei. Zur Planung dieser werden aktuell verschiedene dezentrale 
Lösungen herangezogen. Diese bestehen aus offiziellen Datenangeboten und 
inoffiziellen Wissensspeichern oder liegen redundant vor. Ein zentrales 
Bereitstellungsangebot zur Personalplanung ist derzeit nicht flächendeckend 
vorhanden; die vorhandenen Daten werden weiterhin dezentral genutzt.
Daraus resultieren unter anderem folgende Probleme:
*	Hoher manueller Aufwand bei der Personal- und Einsatzplanung
*	Erhöhte Fehleranfälligkeit durch inkonsistente oder veraltete Daten
*	Geringe Transparenz über verfügbare Kompetenzen und Kapazitäten
*	Erschwerte Vergleichbarkeit und Nachvollziehbarkeit von 
Planungsentscheidungen
*	Abhängigkeit von informellem Wissen einzelner Mitarbeitender
Diese Situation führt insgesamt zu einer ineffizienten Personalplanung, die den 
wachsenden organisatorischen und operativen Anforderungen nur unzureichend 
gerecht wird.

2. Soll-Konzept
2.1 Was soll am Ende des Projektes erreicht sein?
Ziel des Projektes ist die Bereitstellung prozessoptimierter, konsistenter und zentral 
verfügbarer Personaldaten, die system- und anwendungsunabhängig in verschiedenen 
Personal- und Projektprozessen genutzt werden können.
Die Bereitstellung der Daten erfolgt über zwei mögliche komplementäre 
Schnittstellenansätze:
*	eine klassisch definierte REST-API zur standardisierten, performanten und weit 
verbreiteten Systemintegration
*	eine optionale konzeptionelle Vorbereitung zur zukünftigen Anbindung eines 
Model Context Protocols (MCP), sofern die hierfür erforderlichen 
unternehmensinternen Prozesse abgeschlossen sind
Durch diese Architektur wird eine entkoppelte, wiederverwendbare und skalierbare 
Datennutzung ermöglicht. Gleichzeitig schafft sie die technische Grundlage für eine 
spätere Erweiterung um KI-gestützte Analyse- und 
Entscheidungsunterstützungssysteme. Die Umsetzung solcher KI-Funktionalitäten ist 
nicht Bestandteil des Projektes.
Gemäß den Unternehmensrichtlinien der Volkswagen Group Services wird das Projekt 
mit Python umgesetzt. Diese Technologieentscheidung basiert auf:
*	Konformität mit teaminternen Coding-Standards
*	Sicherstellung der Wart- und Weiterentwickelbarkeit durch andere 
Teammitglieder
*	Nutzung einer bestehenden DevOps- und Deployment-Infrastruktur in AWS
*	Verfügbarkeit interner Best Practices und Code-Templates
*	Etablierten Prozessen für Code-Review und Qualitätssicherung
Am Projektende steht ein zentrales, strukturiertes Datenangebot zur Verfügung, das 
aktuelle Anforderungen der Personalplanung erfüllt und technisch zukunftsfähig 
ausgelegt ist.

2.2 Welche Anforderungen müssen erfüllt sein?
*	RESTful-API mit standardisierten HTTP-Methoden (GET, POST, PUT, DELETE)
*	Authentifizierung mittels JWT in Kombination mit OAuth 2.0
*	Rollenbasierte Zugriffskontrolle
*	CRUD-Endpunkte für Mitarbeiter, Kompetenzen, Zertifizierungen und 
Eigenschaften
*	Automatisierte Abfragen (Input: Anforderungen ? Output: passende Kandidaten)
*	Aggregationsendpunkte für Reports (z. B. Kompetenzverteilung, 
Kompetenzlücken)
*	Serverseitige Input-Validierung gegen Injection-Angriffe und Fehleingaben
*	Vollständige API-Dokumentation (OpenAPI/Swagger)
*	Unit- und Integrationstests
*	DSGVO-Konformität inkl. Audit-Logging
*	Berücksichtigung regulatorischer Anforderungen (z. B. Vorbereitung auf den EU AI 
Act im Kontext möglicher späterer Erweiterungen)
*	Deployment in einer AWS-Umgebung

2.3 Einsatz KI-gestützter Entwicklungswerkzeuge im Projektprozess
Zur Unterstützung des Entwicklungsprozesses wird ein KI-gestütztes 
Entwicklungswerkzeug (z. B. Claude Code) eingesetzt. Der Einsatz erfolgt ausschließlich 
werkzeugunterstützend und vergleichbar mit etablierten Entwicklungswerkzeugen wie 
IDE-Autovervollständigung oder statischer Codeanalyse.
Die Nutzung der KI erfolgt insbesondere in folgenden Projektphasen:
*	Unterstützung bei der Formulierung und Überprüfung technischer 
Lösungsansätze
*	Generierung von Code-Vorschlägen für klar abgegrenzte Teilaufgaben
*	Unterstützung bei der Analyse von Fehlermeldungen und 
Optimierungsvorschlägen
Die fachliche Konzeption, Architekturentscheidungen, sicherheitsrelevanten 
Bewertungen, Implementierung der Geschäftslogik sowie die finale Auswahl, 
Anpassung und Integration des Quellcodes erfolgen ausschließlich durch den 
Projektbearbeiter.
KI-generierte Inhalte werden – sofern sie in den Quellcode übernommen werden – 
transparent gekennzeichnet und vor der Nutzung eigenständig geprüft, angepasst und in 
die Gesamtarchitektur integriert. Der eigenständig erbrachte Projektanteil beträgt in 
allen Projektphasen deutlich mehr als 50 %.

2.4 Welche Einschränkungen müssen berücksichtigt werden?
Das Endprodukt muss den geltenden Unternehmensrichtlinien sowie den 
Datenschutzvorgaben entsprechen. Reale Nutzerdaten werden nur unter 
Berücksichtigung der erforderlichen Einwilligungen verarbeitet.
Zur Gewährleistung der IT-Sicherheit ist der Zugriff auf die API ausschließlich über 
gesicherte Authentifizierungs- und Autorisierungsmechanismen zulässig. Alle Eingaben 
werden serverseitig validiert.
Der Betrieb erfolgt innerhalb einer bestehenden AWS-Infrastruktur, wodurch sich 
Einschränkungen hinsichtlich verfügbarer Dienste und Deployment-Prozesse ergeben.
Zusätzlich sind die zeitlichen Vorgaben des IHK-Abschlussprojektes sowie begrenzte 
personelle Ressourcen zu berücksichtigen, weshalb der Funktionsumfang klar 
abgegrenzt wird.

3. Projektstrukturplan entwickeln
3.1 Was ist zur Erfüllung der Zielsetzung erforderlich?
Die Umsetzung erfolgt nach agilen Prinzipien mit iterativen Entwicklungszyklen. Zur 
Sicherstellung der Codequalität wird Test-Driven Development (TDD) eingesetzt. Die 
Versionsverwaltung erfolgt über Git, ergänzt durch kontinuierliche technische 
Dokumentation im Ticketsystem.

3.2 Aufgaben auflisten
Das Projekt wird agil entwickelt, daher sind Zeitangaben nur bedingt aussagekräftig und 
dienen primär der Einordnung der Komplexität.
Analyse (6 h)
*	Anforderungsgespräche mit HR und Projektmanagement
*	Ist-Analyse durchführen
*	Wirtschaftlichkeitsanalyse
*	Use-Cases definieren
*	Lastenheft erstellen
Entwurf (8 h)
*	Datenbankschema und ER-Diagramme
*	API-Architektur definieren
*	OpenAPI/Swagger-Spezifikation
*	Authentifizierungs- und RBAC-Konzept
*	Sicherheitskonzept (DSGVO)
*	MCP-Ressourcen-Schema definieren (Datenmodelle für Ressourcen, URI-
Struktur)
*	MCP-Tools spezifizieren (Funktion, Parameter, Rückgabewerte für 
Kompetenzsuche und Abgleich)
*	Suchfunktionen schematisieren und standardisieren
Implementierung (50 h)
*	Datenbankimplementierung und Schema
*	Backend-API mit Express.js
*	Authentifizierung (JWT) und RBAC
*	CRUD-Endpunkte implementieren
*	Suchfunktionalität implementieren
*	Aggregations-Endpunkte
*	Input-Validierung
*	Unit- und Integrationstests
*	MCP-Server-Grundlagen (Server-Setup, JSON-RPC-Handler, Transport-
Konfiguration)
*	Ressourcen-Handler implementieren (List-, Read-, Subscribe-Mechanismen)
*	Tools implementieren und testen (Kompetenzsuche, Validierung, 
Fehlerbehandlung)
*	Authentifizierung und Logging auf MCP-Ebene
Testing & Deployment (8 h)
*	Unit- und Integrationstests durchführen
*	Load-Tests (Performance)
*	Sicherheitstests
*	User-Acceptance-Testing (UAT)
*	Deployment in der Produktionsumgebung
Dokumentation (8 h)
*	API-Dokumentation (OpenAPI/Swagger)
*	Technische Dokumentation
*	Benutzer-/Administrator-Handbuch
*	Deployment-Guide

4. Ausbildungsstätte und Betreuer
Name der Ausbildungsstätte: 
Volkswagen Group Services, Standort Wolfsburg
Betrieblicher Ausbilder: 
Björn Heitmann

5. Geplante Anlagen zur Präsentation
*	Lastenheft und Use-Case-Beschreibungen
*	Datenbankschema (ER-Diagramme)
*	OpenAPI/Swagger-Spezifikation
*	Quellcode (Python, Git-Versionierung)
*	Unit- und Integrationstests
*	API-Dokumentation
*	Benutzer-/Administrator-Handbuch
*	Projektdokumentation (Bericht)

