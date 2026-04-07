2025-
2026
Transformation Digitale
d’OCKRent
Gouvernance des Données et Plan de Data Management
Amine M'ZALI, Mehdi SAADI, Samy BOUAÏSSA
Projet Data Management & Ethics – Efrei Paris
Table des matières
INTRODUCTION ..................................................................................................................3
1. La Roadmap de Transformation Digitale (2025-2026) .....................................................4
Phase 1 : Fondations & Gouvernance (Mois 0 à 3) ..........................................................4
Phase 2 : Construction du Socle Unifié (Mois 4 à 9) .........................................................4
Phase 3 : Nouveaux Canaux & Services (Mois 6 à 12) ......................................................5
Phase 4 : Renforcement Continu (Transverse - Mois 0 à 12+) ..........................................5
Phase 5 : Plateforme Analytique & Data Science (Mois 12 à 18) ......................................5
Phase 6 : Vision Future (Mois 12 à 18+)...........................................................................5
2. Le Framework de Data Gouvernance pour OCKRent .......................................................6
Rôles et responsabilités ..................................................................................................6
Modèle Opérationnel......................................................................................................8
Principes et directives .....................................................................................................8
Cycle de vie de la donnée et processus associés pour OckRent .....................................10
Mesure de maturité et performances ...........................................................................11
3. L’architecture cible .......................................................................................................14
La data map cible : création des référentiels .................................................................14
L’architecture cible : transformation des SI et flux d’échanges ......................................16
Description détaillée du flux de données : Approche Data Lake Modernisée ................17
4. Le modèle d’information métier de l’entreprise ............................................................19
La gestion du parc et du catalogue ................................................................................19
La gestion des réservations ...........................................................................................20
La gestion des contrats et des finances .........................................................................20
Justification des liens absents .......................................................................................21
4.1 Le Modèle Physique de Données (MPD) Cible .............................................................22
5. Cas d'usage et Valorisation de la Donnée ......................................................................24
Optimisation des Ressources Agence (Staffing & Flotte) ...............................................24
Le Yield Management (Tarification Dynamique) ............................................................25
Maintenance Prédictive & Sécurité ...............................................................................26
Cas Transverse : Prévision Avancée de la Demande ......................................................27
6. Gestion des Métadonnées et Data Catalog ...................................................................28
7. Les règles de data quality sur les données critiques ......................................................29
Phase Discover : diagnostic et compréhension des anomalies ......................................29
Phase Define : Définition des règles et seuils de qualité ................................................29
Phase Integrate : Déploiement et automatisation .........................................................32
1
Phase Monitor : Pilotage et amélioration continue .......................................................32
7.1. Politique de Sécurité, Confidentialité et Conformité des Données .............................32
Classification et Niveaux de Sensibilité ..........................................................................32
Règles de Protection dans l'Architecture Data Lake ......................................................33
Règles de conformité aux Données Critiques ................................................................34
Gouvernance de la Conformité et Audit ........................................................................34
Conclusion Générale .........................................................................................................35
2
INTRODUCTION
La société OCKRent, acteur majeur de la location de véhicules sur le territoire français, se trouve
aujourd'hui à un tournant stratégique décisif. Pour répondre aux nouvelles habitudes de consommation et faire
face à la concurrence, la Direction a lancé un plan de transformation digitale ambitieux visant à centraliser le
pilotage de l'activité et à déployer de nouveaux canaux d'acquisition, notamment via une application mobile et
un site web unifié. Cependant, cette ambition se heurte à une réalité opérationnelle complexe : l'organisation
historique par agences indépendantes a fragmenté le patrimoine de données. L'audit de l'existant révèle un
paysage "en silos" où les systèmes régionaux hétérogènes et des processus manuels basés sur Excel empêchent
une vision consolidée de la flotte et de la clientèle.
Cette fragmentation pose un risque critique pour la réussite du projet digital. L'absence d'un référentiel client
unique et la gestion décentralisée des stocks de véhicules rendent impossible la promesse d'une disponibilité en
temps réel ou d'une expérience client fluide à travers le réseau national. Pour réussir sa mutation d'un modèle
décentralisé vers une entreprise "Data Driven", OCKRent ne doit pas seulement moderniser ses outils, mais
refondre profondément sa culture et son architecture de données. La donnée ne peut plus être un sous-produit
de la gestion locale ; elle doit devenir un actif d'entreprise capable de soutenir à la fois les transactions et
l'analyse.
Ce document présente la stratégie et le cadre de référence pour opérer cette transformation. Il détaille en
premier lieu la Roadmap à mener pour atteindre ces objectifs de manière optimale. Nous définirons ensuite
le Framework de Data Gouvernance proposé pour structurer l'organisation. Le rapport exposera les fondations
du Data Management, incluant l'architecture cible (nouveaux référentiels, transformation des SI et services
d'échanges) ainsi que le modèle d’information métier global de l’entreprise. Nous approfondirons par la suite
les modèles de données des référentiels et leurs règles métiers, les règles de Data Quality sur les données
critiques, ainsi que les dispositifs de conformité et de protection des données. Enfin, nous présenterons une
proposition d'architecture analytique et une liste de cas d’usage pertinents pour l'entreprise.
3
1. La Roadmap de Transformation Digitale (2025-2026)
La transformation d'OCKRent ne se résume pas à une simple mise à jour logicielle ; c'est une refonte structurelle
visant à passer d'une fédération d'agences indépendantes à une entreprise unifiée et pilotée par la donnée.
Pour garantir le succès de cette mutation et atténuer les risques opérationnels liés à la fusion des systèmes
historiques (Lavande, Tulipe, etc.), nous avons structuré le projet selon une Roadmap sur 18 mois, découpée en
phases progressives. Cette approche permet de sécuriser les fondations avant d'ouvrir les vannes des nouveaux
canaux digitaux.
Voici le détail des phases stratégiques :
Phase 1 : Fondations & Gouvernance (Mois 0 à 3)
Cette première phase est critique pour éviter de reproduire le chaos actuel dans le futur système unifié. Avant
toute implémentation technique, la priorité est de structurer l'organisation humaine et les règles de gestion. Cela
commence par le lancement de la gouvernance et la nomination officielle des rôles clés, notamment le Chief
Data Officer (CDO) pour piloter la stratégie et les Data Owners pour chaque domaine métier (Client, Produit,
Réservation, Agence). Ces acteurs doivent immédiatement définir les standards de données pour casser
l'autonomie historique des agences locales. Parallèlement, un chantier d'audit et d'architecture sera mené pour
cartographier exhaustivement les sources de données existantes. La mise en place d'un Data Catalog (catalogue
de données) sera la pierre angulaire de cette démarche : il permettra de recenser, documenter et définir
précisément tout le patrimoine de données, incluant le "Shadow IT" (fichiers Excel, PowerPoint), afin de préparer
des spécifications de migration fiables vers le socle d'échange sécurisé.
Phase 2 : Construction du Socle Unifié (Mois 4 à 9)
Objectif : « Construire la Source Unique de Vérité. »
Une fois les règles établies, cette phase de "gros œuvre" vise à sortir de la logique de silos régionaux pour bâtir
les Master Data Management (MDM) qui centraliseront le savoir de l'entreprise. Les équipes techniques
procéderont au développement des quatre bases maîtresses : le MDM Client pour fusionner les bases régionales
(Lavande, Tulipe) et créer un "Golden Record" unique ; le MDM Produit (Véhicule) pour consolider la flotte et
numériser les offres ; et les référentiels Agence et Réservation pour remplacer les fichiers bureautiques. Cette
étape comprend la migration et la centralisation massive des données historiques vers ces nouveaux
4
réceptacles, ainsi que la validation de l'architecture par des tests de charge, garantissant que le système central
peut supporter les requêtes simultanées de toutes les agences nationales
Phase 3 : Nouveaux Canaux & Services (Mois 6 à 12)
Objectif : « Ouvrir l'entreprise au client digital. »
Dès lors que les données sont nettoyées et centralisées, le projet peut se tourner vers la construction des
interfaces visibles par le client. C'est à cette étape que sont lancés la plateforme de réservation, le nouveau site
Web et l'application mobile unifiée. Contrairement aux tentatives passées, ces outils ne fonctionneront plus en
vase clos mais viendront "consommer" en temps réel les données des référentiels centraux via une stratégie
d'ouverture par APIs. Le déploiement de l'API critique "Disponibilité Temps Réel" permettra notamment
d'interroger le stock physique global instantanément, éliminant ainsi le risque de surbooking entre le canal web
et le comptoir physique.
Phase 4 : Renforcement Continu (Transverse - Mois 0 à 12+)
Objectif : « Maintenir la qualité dans la durée. »
La qualité des données n'est pas un projet ponctuel, mais un processus continu qui traverse toutes les phases de
la roadmap. Ce chantier de renforcement continu repose sur une gouvernance active, animée par des comités
réguliers pour arbitrer les conflits de données inter-régionaux. Au quotidien, les Data Stewards surveilleront les
indicateurs de performance (KPIs) via des tableaux de bord dédiés, traquant par exemple le taux de doublons ou
la complétude des fiches clients. L'accent sera mis sur l'adoption utilisateurs et le principe de "Quality at Source",
en formant les agents et en intégrant des contrôles bloquants dans les interfaces de saisie pour empêcher la
création de nouvelles données erronées.
Phase 5 : Plateforme Analytique & Data Science (Mois 12 à 18)
Objectif : « Valoriser la donnée pour décider. »
Avec des opérations transactionnelles sécurisées, OCKRent pourra basculer vers l'analyse avancée. Cette phase
consacre la mise en place du Data Lake, un entrepôt capable de stocker des volumes massifs de données
brutes et hétérogènes issues de tous les référentiels. Ce socle technique alimentera les outils de Business
Intelligence (BI) et de visualisation, offrant enfin à la Direction une vision consolidée de l'activité. C'est
également sur cette infrastructure que les Data Scientists déploieront les cas d'usage à forte valeur ajoutée
identifiés, tels que l'optimisation des ressources agence ou les algorithmes de Yield Management pour la
tarification dynamique.
Phase 6 : Vision Future (Mois 12 à 18+)
Objectif : « Innover et anticiper. »
Enfin, l'aboutissement de cette roadmap positionnera OCKRent comme un leader technologique capable
d'innovation continue. Le socle de données robuste et la maturité acquise permettront d'intégrer des
technologies émergentes, comme l'IoT pour la maintenance prédictive via la télémétrie des véhicules.
L'entreprise sera également prête à explorer de nouveaux modèles économiques, tels que l'autopartage ou la
location à la minute, qui exigent une maîtrise parfaite et instantanée de la donnée véhicule et client.
Cette roadmap ambitieuse mais réaliste permet à OCKRent de lisser l'effort de transformation. Elle garantit que
chaque nouvelle fonctionnalité digitale (Site Web, App, Pricing dynamique) repose sur des fondations solides,
évitant ainsi l'effet "château de cartes" d'une digitalisation précipitée sans gouvernance.
5
2. Le Framework de Data Gouvernance pour OCKRent
Le cadre de Data Gouvernance (DG) proposé vise à établir l'autorité et les processus nécessaires pour gérer
les 4 Référentiels Clés identifiés (Client, Employé, Réservation, Produits) comme des actifs stratégiques partagés.
Rôles et responsabilités
Le choix des rôles s'appuie sur la nécessité de passer d'une gestion de la donnée décentralisée (par agence) à
une gestion centralisée et uniformisée (objectif du projet), en garantissant la qualité et la conformité.
Instances de décision et de Supervision
Rôle Niveau de Décision Périmètre & Données
Spécifiques Gérées Justification du Choix
Comité de
Gouvernance
Data
Stratégique/Direction
Vision Globale,
Arbitrage des conflits
inter-domaines,
Validation des
politiques de données.
Cette entité est la seule à détenir l'autorité
pour lever les blocages
organisationnels liés à la transformation.
Elle doit imposer la centralisation des
données des agences et valider les
investissements nécessaires pour les
nouveaux canaux (Web/Mobile) et la
plateforme analytique.
Chief Data
Officer (CDO) Tactique/Transverse
Architecture des 4
Référentiels, Cycles de
Vie, Normes de
Qualité, Animation de
la gouvernance
opérationnelle.
Le CDO est le "chef d'orchestre" de la
transformation Data. Il est essentiel
pour assurer la cohérence (selon l'image)
des règles entre les agences historiques et
les nouveaux systèmes. Il pilote la stratégie
de Data Management, incluant les
chantiers de centralisation et
d'uniformisation de la gestion des
données.
Data
Protection
Officer (DPO)
Conformité/Réglementaire
Données à Caractère
Personnel (Client,
Employé), respect
du RGPD.
La fusion des bases clients issues de
chaque agence est une opération à haut
risque réglementaire. Le DPO
doit informer et conseiller
l'organisation pour garantir que le
nouveau SI centralisé respecte les droits
des personnes et la confidentialité lors de
l'ouverture des canaux Web/Mobile.
Rôles de Data Ownership (responsabilité métier)
Ces rôles sont cruciaux pour définir les règles métier uniformes et casser l'autonomie historique des agences.
Domaine de
Données
Data Owner
(Responsable
Métier)
Choix des Données Clés et des Règles Justification du Choix du
Responsable
CLIENT Directeur Marketing
Données Clés : Identité, Coordonnées,
Permis. Règles : Définir la règle de gestion
des doublons post-fusion ; standardiser la
façon dont le consentement est recueilli
sur tous les canaux (agence, web, mobile).
Justification : Le Marketing
est le moteur de la nouvelle
stratégie d'acquisition de
clientèle via le digital. Le Data
Owner Client doit garantir
que les données sont
6
Domaine de
Données
Data Owner
(Responsable
Métier)
Choix des Données Clés et des Règles Justification du Choix du
Responsable
exploitables pour des
campagnes ciblées et la vision
stratégique du client.
PRODUITS
(Flotte de
Véhicules)
Directeur de Flotte
Données Clés : VIN, Plaque, État
(Disponible/Maintenance),
Catégorie. Règles : Uniformiser la
catégorisation des véhicules entre les
agences et le système central (pour la
réservation en ligne) ; définir les critères
de statut "disponible" (pour éviter les
surréservations).
Ce rôle est clé pour la
"meilleure gestion de la
flotte". L'optimisation du parc
(chantier d'analyse de la
variation des réservations)
relève de la direction de la
Flotte, qui est responsable de
la vision stratégique de cette
donnée.
RÉSERVATION
Directeur des
Opérations /
Revenue Manager
Données Clés : Dates, Agence, Offre,
Statut (Confirmée/Facturée). Règles
: Définir les règles de calcul de la
facturation/CA uniforme ; établir le
processus d'établissement du contrat et
de la transaction de paiement associée.
Le Revenue Manager (ou les
Opérations) est responsable
de l'optimisation des revenus
et de la fluidité du processus.
Il doit superviser la qualité
des données qui lient le client
au produit et génèrent le
revenu.
AGENCE Directeur Réseau
Données Clés : Coordonnées, Heures, ID
(Identifiant Unique). Règles : Définir
les normes de mise à jour des
informations de l'agence.
Ce référentiel est la colle qui
permet la centralisation. Le
Directeur Réseau gère
l'ensemble du réseau et doit
s'assurer de l'exactitude des
informations des agences
pour les nouveaux canaux de
réservation (le client doit
savoir où récupérer son
véhicule).
Rôles opérationnels (mise en œuvre)
Rôle Niveau de Décision Périmètre & Données
Spécifiques Gérées Justification du Choix
Data
Stewards Opérationnel/Domaine
Qualité,
Documentation,
Sécurité et Intégrité
des données des 4
référentiels au
quotidien.
Le Data Steward est l'opérationnel de la donnée
et garant de la qualité. Il sera indispensable pour
réaliser les chantiers de contrôle de la qualité et
la correction des inexactitudes (les 32% d'erreurs
potentielles mentionnées dans l'image). Ils
seront la première ligne de défense contre les
problèmes de qualité engendrés par la fusion des
SI.
Data
Analyst /
Data
Scientist
Opérationnel/Analyse
Données agrégées et
transformées pour
l'analyse.
Ces rôles sont essentiels pour le chantier de mise
en place d'une plateforme analytique et
l'évaluation des réservations. Ils dépendent
directement de la qualité et de l'uniformité des
données assurées par les Data Stewards et Data
Owners.
7
Modèle Opérationnel
Nous avons fait le choix d’un modèle centralisé ("Hub & Spoke") pour les 4 référentiels.
En effet, pour permettre à un client de réserver un véhicule à Marseille et le rendre à Paris (impossible en mode
silos), ou de réserver sur le Web un véhicule stocké en agence, les données de référence doivent être uniques et
partagées. Ainsi, le modèle se décline comme suit :
- Référentiel Maître (Hub) :
Le Siège héberge les bases maîtresses pour Client, Employé, Véhicule et Réservation. C'est donc la "source
unique de vérité". Aucune agence ne possède sa propre définition d'un véhicule ou d'un client.
- Systèmes Locaux (Spokes) :
Les agences n'ont plus de base de données locale autonome. Elles utilisent le Nouveau SI qui lit et écrit
directement dans les référentiels centraux via des APIs sécurisées.
Exemple Employé : Un agent se connecte avec son ID unique (géré par le Réf. Employé). Le système lui donne les
droits correspondants à son rôle.
Exemple Véhicule : L'agence met à jour le kilométrage (saisie locale), qui met à jour immédiatement le Réf.
Produits central.
Principes et directives
Ces principes sont essentiels pour réussir la transformation digitale, en passant d'une gestion locale et
indépendante à un modèle centralisé et data-driven. Le principe fondamental chez OCKRent est que la donnée
est un actif d'entreprise (Data is an enterprise asset).
Principe 1 : Data is Findable & Understandable (Donnée Trouvable et Compréhensible)
Ce principe impose la documentation et la compréhension uniforme des données dans l'entreprise, une
nécessité absolue après la fusion de plusieurs SI d'agences indépendantes.
OCKRent doit documenter, partager et maintenir les métadonnées pour ses référentiels, incluant leur définition,
confidentialité, et source, dans un catalogue central (Data Catalog).
Chaque champ des quatre référentiels (Client, Produit, Réservation, Agence) doit avoir une définition unique et
validée par le Data Owner. Par exemple, le champ Statut_Véhicule doit être défini de la même manière par
l'agence de réservation, l'application mobile, et le système de maintenance pour que la donnée soit comprise
par tous.
Principe de "Quality at Source" et de Modélisation : Il est interdit de démarrer tout développement IT sans un
modèle de données défini (ne pas démarrer un projet IT sans un Data Model). Ce modèle doit intégrer des
validations à la saisie.
8
Principe 2 : Data is Secured & Compliant (Donnée Sécurisée et Conforme)
Ce principe garantit que la donnée est protégée et que son utilisation respecte la loi, en particulier le RGPD (Data
process or processing must comply with the law).
Directive de Conformité RGPD et Sécurité : Les données doivent être traitées, stockées, et transférées comme
convenu par leurs Owners et conformément aux procédures légales (telles que le RGPD). L'entreprise doit
prendre les mesures nécessaires pour s'assurer que les données sont protégées contre les accès non autorisés
et la perte.
Étant donné la centralisation de la base client (données personnelles) et les paiements, OCKRent doit assurer la
protection des données client et mettre en place des processus de traçabilité. Chaque action dans le SI (création
de contrat, validation de retour) doit être loguée et liée à un identifiant unique du référentiel Employé,
garantissant la traçabilité des accès aux données clients sensibles.
Principe d'Identité Unique et de Non-Doublon : Un véhicule doit être identifié uniquement par son VIN ou
sa Plaque dans tout le réseau OCKRent. Le système central doit interdire la création d'un nouveau véhicule ou
client si un enregistrement avec le même identifiant existe déjà (Principe du "Golden Record" : il est interdit de
créer un doublon).
Principe 3 : Data is Fit for Purpose (Donnée Adaptée à l'Usage)
Ce principe stipule que la donnée doit être de haute qualité et utilisable (Data is of high quality and usability)
pour que les utilisateurs puissent en tirer des informations utiles et atteindre les objectifs stratégiques.
Directive de Cohérence et de Qualité : Il faut définir et implémenter des règles métier pour continuellement
améliorer la qualité des données. La cohérence des données doit être préservée (Always preserve data
consistency).
Pour le référentiel Produits/Flotte, la règle de statut "Disponible" pour un véhicule doit être cohérente et ne
provenir que de sa Source Unique de Vérité (SPOT), c'est-à-dire le système central de gestion de flotte, pour
éviter le surbooking. La qualité des données (exactes, complètes, fiables) est critique pour l'analyse des
réservations (l'objectif d'améliorer l'offre et le volume des voitures).
Principe 4 : Data is Shared & Accessible (Donnée Partagée et Accessible)
Ce principe est essentiel pour la nouvelle stratégie multi-canal d'OCKRent, qui souhaite créer de nouveaux canaux
de réservation (Mobile & Web application) et s'intégrer avec des partenaires.
Directive du Partage par API et Référentiels Transversaux : Les données doivent toujours être partagées avec des
moyens réutilisables (Always share your data, with reusable ways such as API). Il est nécessaire de construire et
d'intégrer des référentiels d'entreprise pour les périmètres transversaux.
Le référentiel Réservation et Produits (Flotte) doit être accessible via des APIs au site web, à l'application mobile
et aux systèmes des partenaires. Ceci garantit la "disponibilité en temps réel" des données : toute modification
du statut d'un Produit ou création d'une Réservation doit être visible par tous les canaux en temps quasi-réel (ex:
moins de 5 secondes) pour éviter le surbooking.
9
Cycle de vie de la donnée et processus associés pour OckRent
Nous allons définir des processus spécifiques pour chaque étape du cycle de vie des données d'OCKRent, en nous
concentrant sur les défis posés par la transformation (multi-canal et centralisation).
Phase 1 : Collecte des données (Acquisition ou Saisie)
Cette phase est critique, car les données peuvent être créées ou acquises à partir de sources très différentes
(saisie manuelle en agence, capture automatique via le web/mobile). La récupération nécessite le consentement
des personnes concernées et doit se cantonner aux informations nécessaires pour l'opération.
Référentiel Processus
Associé Détail du Processus pour OCKRent
CLIENT
Processus
d'Ajout d'un
Client
Qui : Agent de comptoir, application mobile ou site web. Quand : Lors de la
première réservation ou de la création de compte. Comment : Le nouveau
système central doit valider l'unicité du client (pas de doublon) et s'assurer
que le consentement RGPD (Data Privacy) est recueilli de manière traçable.
Le processus doit être le même quel que soit le canal.
RÉSERVATION
Processus de
Création d'une
Réservation
Qui : Agent, Client (Web/Mobile), ou Partenaire (API). Comment : Le
processus doit vérifier la disponibilité temps réel du véhicule dans le
Référentiel Produits/Flotte. En cas de non-disponibilité, le processus doit
bloquer la saisie (principe Quality at Source).
Phase 2 : Stockage et traitement des données
Les données fraîches doivent être stockées dans un environnement sécurisé. Les données doivent également
être traitées (nettoyage des données, cryptage/anonymisation).
Référentiel Processus Associé Détail du Processus pour OCKRent
CLIENT
Processus
d'Anonymisation
pour l'Analyse
Comment : Avant l'envoi vers la nouvelle plateforme analytique
(DataLake pour Big Data/Analytique), les données personnelles
identifiantes (nom, prénom) doivent subir une anonymisation ou un
cryptage pour les cas d'usage analytiques (ex : l'évaluation de la variation
des réservations).
RÉSERVATION
Processus de
Stockage Sécurisé du
Contrat
Comment : Le contrat final et les données de paiement associées sont
stockés dans une base de données relationnelle (données
opérationnelles classiques) centralisée et hautement sécurisée, pour
garantir la protection contre les accès non autorisés.
Phase 3 : Analyse et réutilisation des données
Les résultats du traitement sont analysés pour répondre aux questions qui ont déclenché la collecte, notamment
à travers des outils de visualisation ou de Machine Learning.
10
Référentiel Processus Associé Détail du Processus pour OCKRent
PRODUITS
(Flotte)
Processus de
Réutilisation de la
Donnée d'Usage
Qui : Data Scientists / Data Analysts. Quand : Lors de l'évaluation de la
variation des réservations par type de véhicule et saison. Comment : Les
données sont réutilisées pour répondre à une nouvelle interrogation
(optimisation du parc). Le processus doit s'assurer de la traçabilité de toutes
les opérations/modifications apportées aux données transformées pour
l'analyse.
CLIENT Processus de
Partage via API
Comment : Le Référentiel Client est exposé via des APIs sécurisées
(Directive Data is Shared & Accessible) aux nouveaux canaux (Web/Mobile) et
aux partenaires pour les campagnes de fidélisation ou les offres
personnalisées (réutilisation des données).
Phase 4 : Sauvegarde et suppression des données
Cette phase garantit la conservation et la destruction appropriée des données. Une copie de la donnée est créée
lors de la sauvegarde pour optimiser sa sécurité.
Référentiel Processus Associé Détail du Processus pour OCKRent
RÉSERVATION
Processus
d'Archivage et de
Sauvegarde
Comment : Les données transactionnelles exploitées régulièrement
(réservations en cours) sont stockées sur des supports rapides. Les
données plus anciennes (contrats archivés) sont déplacées sur
des supports plus lents et moins coûteux (règle générale de sauvegarde).
CLIENT
Processus de
Suppression des
Données
Personnelles
Comment : Le processus doit stipuler une date de « péremption » pour
les données client inactives. Il doit aussi garantir la bonne destruction et
l'absence de copies pour donner suite à l'exercice d'un droit de
suppression (droit RGPD).
Mesure de maturité et performances
Évaluation de la Maturité Data : Modèle CMMI
Étant donné que OCKRent est une entreprise en pleine transformation, passant d'un modèle décentralisé
(agences indépendantes) à un modèle centralisé, elle se situe actuellement au Niveau 1 (Initial) ou Niveau 2
(Géré) du CMMI.
Niveau
CMMI Cible
Caractéristique du
Processus Objectif de la Transformation OCKRent
Niveau 3 :
Défini
Processus organisé et
maîtrisé ; Processus
définis proactivement.
Cible à Atteindre : Le projet de centralisation du SI et l'identification des
référentiels doivent permettre à OCKRent de définir et de documenter
des processus standardisés (Réservation, Ajout Client) pour toutes les
agences et tous les canaux.
Niveau 4 :
Quantifié
Processus mesuré et
contrôlé.
Objectif à Long Terme : Le chantier de "Mise en place des mesures et
des contrôles de la qualité des données" ainsi que la plateforme
analytique permettront de disposer de métriques pour passer à ce
niveau.
L'évaluation initiale doit servir à identifier les axes de progrès et à mesurer la capacité de l'organisation à mener
à bien les projets.
11
Indicateurs Clés de Performance (KPIs)
Les KPIs de la Data Gouvernance (DG) doivent être alignés sur les objectifs de la transformation d'OCKRent
: Centralisation/Uniformisation, Qualité des Référentiels et Conformité Réglementaire.
Axe de Mesure KPI Spécifique pour OCKRent Lien avec le Projet
Organisation
Data
% de domaines de données
couverts par un Data
Owner/Steward.
Mesurer la mise en place effective des rôles définis
(Client, Produit, Réservation, Agence). L'objectif est
d'atteindre 100% de couverture pour les 4 référentiels
critiques.
La
Documentation
% des champs de données critiques
documentés par domaine de
données dans un
glossaire/catalogue central.
Mesurer l'avancement du chantier d'uniformisation.
Exemple : Pour le référentiel Produits, 100% des
champs définissant la catégorie de véhicule doivent
avoir une définition unique et acceptée par tous.
La Conformité % des traitements de données
personnelles déclarés (RGPD/DPO).
Mesurer la conformité post-centralisation et
l'ouverture des nouveaux canaux. Le DPO doit auditer
et valider le processus de fusion des bases clients et les
mécanismes de consentement sur les applications
Web/Mobile.
La Qualité des
Données (QoD)
% de données critiques/transverses
dont la qualité mesurée est au-
dessus des seuils (ex : complétude
du permis client, exactitude du
statut "disponible" du véhicule).
Mesurer l'efficacité du chantier de mise en place des
contrôles de qualité. C'est le KPI le plus directement lié
au succès des réservations en ligne et de l'analyse de
flotte. Le seuil doit être fixé très haut (ex : > 98% de
données client sans doublon).
Performance
Métier
Réduction du % de sur-
réservations (double-booking) par
an.
Mesurer l'impact de la DG sur le métier. L'amélioration
de la qualité des données sur le
référentiel Produits (disponibilité) doit réduire les
erreurs qui pénalisent l'expérience client et l'efficacité
opérationnelle.
Ces mesures permettront à OCKRent de piloter la gouvernance et d'assurer que le programme de transformation
IT et Data est une réussite, en rendant la donnée fiable pour les nouvelles plateformes et les cas d'usage
analytiques.
Ainsi, voici une vue synthétique du framework de data gouvernance que nous proposons à OCKRent :
12
Nous avons établi le framework de data gouvernance en 3 couches. La première couche traite de la vision et
l'organisation (stratégique). C'est le « QUI » et le « POURQUOI ». Cette couche valide notre choix de modèle
opérationnel et les rôles dirigeants.
La deuxième couche traite des fondations et des règles. C'est le « QUOI ». Cette couche définit les actifs à
protéger et les règles que les opérationnels doivent suivre.
La troisième couche traite l'opérationnel et le flux (opérationnel). C'est le « COMMENT » et le « QUAND ». Cette
couche détaille l'exécution quotidienne de la gouvernance.
Enfin, nous avons défini un axe transversal, qui concerne la mesure et l'amélioration. Cet axe traverse les trois
couches pour assurer le pilotage.
13
3. L’architecture cible
Actuellement, le paysage de données d'OCKRent se caractérise par une forte fragmentation et un manque
de gouvernance technique. Comme illustré dans la cartographie actuelle, l'entreprise opère en silos
géographiques étanches. Les données Clients et Véhicules sont dupliquées et isolées dans des systèmes
régionaux hétérogènes (les instances "Lavande" pour le Nord, "Tulipe" pour le Sud, "Acacia" et "IRIS").
Concrètement, cela signifie qu'un client fidèle en Bretagne est un inconnu total s'il se présente dans une
agence du Sud, empêchant toute vision "360 degrés" ou programme de fidélité global.
Plus critique encore pour la transformation digitale, des données fondamentales sont gérées via du
"Shadow IT", c'est-à-dire en dehors des systèmes sécurisés. La liste des Agences repose sur de simples
fichiers Excel, et le catalogue des Offres est enfermé dans des présentations PowerPoint. Cette situation
est un point de blocage majeur : une application mobile ou un site web ne peut pas s'interfacer avec un
fichier PowerPoint pour afficher un prix, ni avec un Excel local pour géolocaliser une agence en temps réel.
Il est donc impératif de rationaliser cet existant.
La data map cible : création des référentiels
Pour soutenir la centralisation, nous devons mettre en place quatre référentiels de données maîtres (Master
Data Management) qui serviront de "source unique de vérité" pour toute l'entreprise.
Le Référentiel Client (MDM Client)
Actuellement, un client "Jean Dupont" qui loue en Bretagne (système Lavande) n'est pas reconnu s'il loue à Nice
(système Tulipe). Il n’y a donc pas de vision 360°.
La priorité est donc la consolidation des bases "Lavande-Cust", "Tulipe-Cust", etc., vers un référentiel centralisé.
Ce nouveau système devra attribuer un identifiant unique à chaque client et appliquer des règles de
dédoublonnage strictes (le "Golden Record"). Il contiendra les données d'identité, de contact et surtout de
permis de conduire. C'est ce référentiel qui alimentera l'espace client du futur site web et permettra au
marketing d'avoir une vision unifiée pour ses campagnes, quel que soit le lieu de location historique du client.
14
Le Référentiel Produit (Parc cet Offres, MDM Produit)
Actuellement, les véhicules sont gérés localement. Il est impossible de savoir globalement combien de "Clio" sont
disponibles. De plus, les offres sont dans des PPT (PowerPoint), donc inaccessibles au site Web.
Nous devons donc créer un référentiel unique pour la flotte automobile, fusionnant les silos "Véhicule"
régionaux. Chaque voiture sera identifiée par son VIN (Vehicle Identification Number) et son statut (disponible,
en maintenance, loué) sera visible au niveau national. En parallèle, et c'est un changement majeur, il faut
numériser le catalogue des offres. Les données contenues dans les PowerPoint (prix, catégories, assurances)
doivent être structurées dans une base de données "Catalogue Offre". C'est cette base qui permettra au site web
d'afficher dynamiquement les prix et les disponibilités.
Le Référentiel Agence
Actuellement, la liste des agences est gérée sur Excel. C'est une donnée critique non sécurisée et difficile à mettre
à jour pour le site web (horaires, adresses).
L’objectif est donc d'abandonner définitivement la gestion par fichier Excel. Nous allons implémenter un
référentiel de données de référence (Reference Data) dédié à la structure de l'entreprise. Il centralisera les
informations administratives, les horaires d'ouverture et surtout les coordonnées GPS exactes de chaque agence.
Ce référentiel sera la source qui alimentera la carte interactive de la future application mobile.
Le Référentiel de Réservation
Actuellement, les réservations sont cloisonnées. Il y a donc un risque de surbooking si on ouvre le Web sans
centralisation. De plus, on remarque également une dispersion des contrats.
Ainsi, pour éviter le surbooking entre les agences physiques et les nouveaux canaux digitaux, il faut mettre en
place un référentiel de Réservation. Contrairement aux bases actuelles cloisonnées ("Lavande-Resa", etc.), ce
système central recevra toutes les demandes de location. Il fera le lien en temps réel entre un client (vérifié dans
le MDM Client) et un Véhicule (vérifié dans le MDM Véhicule), garantissant ainsi l'intégrité des transactions.
Ainsi, voici la data map que nous proposons à OCKrent :
15
Le choix de classification des données repose sur leur nature, leur fréquence de modification et leur usage au
sein du système d'information. Les données Clients et Véhicules sont classées en Master Data (MDM) car ce sont
des objets métiers critiques, partagés par tous les services, et sujets à des cycles de vie complexes nécessitant
une gestion stricte de l'unicité (création d'un "Golden Record" pour fusionner les doublons entre les régions).
À l'inverse, les données agences relèvent des données de référence car elles constituent une nomenclature
stable (liste de lieux, codes agences) mise à jour très rarement, servant de norme pour valider les saisies. Enfin,
les réservations sont des données transactionnelles : ce sont des événements historiques à forte volumétrie (flux
continu) qui n'ont pas vocation à être dédoublonnés mais enregistrés. L'architecture repose sur une logique de
consommation : la donnée transactionnelle (la réservation) se construit en "consommant" les données maîtres
(client, véhicule) et les données de référence (agence).
L’architecture cible : transformation des SI et flux d’échanges
L'architecture technique doit évoluer pour supporter ces nouveaux référentiels, ce qui implique des
suppressions et la création de nouveaux flux d'échange.
Systèmes à décommissionner ou transformer
La transformation implique une rupture avec les pratiques bureautiques : les fichiers Excel de gestion des
agences et les PowerPoint des offres doivent être supprimés en tant qu'outils de gestion opérationnelle. Ils
seront remplacés par des interfaces de saisie web connectées directement aux nouveaux référentiels.
Concernant les SI régionaux (Lavande, Tulipe, etc.), ils ne doivent plus être "maîtres" de la donnée. À terme,
ils devront soit être remplacés par un ERP unique, soit être connectés via des interfaces pour ne faire que
"consommer" la donnée créée centralement.
16
Services d'échanges de données (API)
Pour faire circuler cette donnée propre, nous allons déployer une architecture orientée services (API).
Le flux critique sera l’API "Disponibilité Temps Réel". Ce flux est le moteur de la nouvelle stratégie digitale.
Lorsqu'un client effectue une recherche sur l'application mobile, celle-ci interrogera via une API le Référentiel
Produits (Véhicule) pour connaître le stock physique, et le Référentiel Réservation pour vérifier les engagements
en cours. Cela garantit qu'aucun véhicule indisponible ne soit proposé à la location.
Un second flux majeur sera l’API "Client 360". Une API dédiée permettra la création et la mise à jour des fiches
clients depuis n'importe quel canal (comptoir d'agence ou web). Elle agira comme un garde-fou en interrogeant
le moteur de règles du MDM Client pour s'assurer qu'aucun doublon n'est créé lors de la saisie, garantissant
l'unicité du contact.
Enfin, pour répondre aux besoins d'analyse avancée (variation des réservations selon les saisons, événements
culturels), nous mettrons en place des flux d'alimentation pour déverser les données vers un Data Lake.
Contrairement à un Data Warehouse classique, le Data Lake permettra de stocker des données brutes et variées
issues des différents référentiels. Cette plateforme analytique sera le socle pour développer les cas d'usage à
forte valeur métier et les algorithmes prédictifs demandés par la direction.
Description détaillée du flux de données : Approche Data Lake Modernisée
Afin de soutenir la centralisation et les nouveaux usages analytiques décrits précédemment, nous avons modélisé
le cycle de vie complet de la donnée au sein de la nouvelle architecture d'OCKRent. Ce schéma illustre le passage
d'une gestion cloisonnée à une plateforme unifiée de type Data Lake, capable d'absorber la volumétrie et la
variété des données (structurées et non structurées).
Le choix technologique de déployer un Data Lake plutôt qu'un Data Warehouse traditionnel ou une architecture
Lakehouse complexe répond spécifiquement aux ambitions de transformation d'OCKRent et à la nature variée
de ses données. Contrairement à un entrepôt de données classique qui impose une structure rigide dès
l'ingestion, le Data Lake offre la flexibilité indispensable pour centraliser des données hétérogènes, allant des
transactions structurées aux flux non structurés futurs comme la météo ou le trafic, essentiels aux modèles
prédictifs. Cette architecture permet de maintenir une zone de données brutes ("Raw") pour l'exploration
avancée des Data Scientists, tout en sécurisant une zone nettoyée ("Curated") pour le reporting décisionnel,
garantissant ainsi que les métiers ne consomment que des données fiabilisées. D'un point de vue structurel, cette
architecture agit comme une véritable usine de valorisation : en forçant la convergence de tous les flux régionaux
vers ce point central, elle casse mécaniquement les silos historiques pour instaurer une "source unique de
vérité". De plus, en découplant techniquement les opérations de location des traitements analytiques, elle assure
que l'analyse massive de l'historique ne ralentira jamais la performance du système transactionnel utilisé au
quotidien en agence.
Le fonctionnement de cette architecture s'articule autour de cinq étapes clés, garantissant la transformation de
la donnée brute en valeur métier :
 1. Sources de Données (Collecte Multicanale) : En amont, l'architecture capte l'ensemble des flux
générés par l'activité d'OCKRent. Cela inclut les données issues de la migration des Agences Locales
(données terrain historiques), les flux transactionnels du Front Web & Mobile (réservations, interactions
clients) ainsi que les données référentielles du SI Central. Cette couche assure l'exhaustivité de la
collecte.
 2. Couche d'Ingestion (ETL/ELT) : Les données sont acheminées vers le stockage central via des APIs
internes et des flux d'intégration. Cette couche est hybride : elle gère à la fois la collecte en temps réel
(indispensable pour la disponibilité des véhicules sur le mobile) et les traitements par batch pour les
volumes historiques. Elle agit comme le "robinet" principal alimentant la plateforme.
17
 3. Stockage Central (Data Lake OCKRent) : Contrairement à un entrepôt de données traditionnel rigide,
nous optons pour une architecture Data Lake divisée en deux zones distinctes pour mieux gérer la
gouvernance :
o Zone Brute (Raw Data) : Elle stocke les données telles qu'elles arrivent des sources, sans
altération. C'est notre "mémoire parfaite" qui permet de revenir à la source en cas d'erreur ou
d'audit.
o Zone Nettoyée (Curated Data) : C'est la zone de confiance. Les données y sont stockées après
avoir été validées, dédoublonnées et standardisées. C'est cette zone qui servira de base unique
pour les analyses.
 4. Couche de Traitement & Qualité : Située entre les deux zones du Data Lake, cette couche est le
moteur de fiabilisation. Elle applique les règles de Transformation & Qualité définies dans la
gouvernance : dédoublonnage des fiches clients (Golden Record), enrichissement des données de flotte
et application des règles métier. Elle assure que seule une donnée propre passe de la zone "Raw" à la
zone "Curated".
 5. Utilisateurs & Sorties (Consommation) : Enfin, la donnée valorisée est exposée pour trois usages
distincts :
o Reporting BI : Alimentation des tableaux de bord et KPIs pour le pilotage opérationnel.
o Data Science : Mise à disposition de données granulaires pour les modèles prédictifs (IA,
prévision de la demande).
o API Partenaires : Exposition sécurisée de données enrichies vers l'écosystème externe.
L'ensemble de ce flux est supervisé transversalement par une couche de Gouvernance & Sécurité, garantissant
la gestion des accès et la conformité RGPD à chaque étape du cycle de vie.
Globalement, cette architecture n'est pas conçue comme un simple lieu de stockage, mais comme une véritable
chaîne de production de valeur qui réconcilie l'héritage physique d'OCKRent avec ses ambitions digitales.
Sa structure linéaire (Collecte  Transformation  Consommation) apporte une réponse directe à la
fragmentation historique en silos régionaux. En forçant toutes les données à converger vers un point central
unique avant d'être redistribuées, elle garantit mécaniquement l'unicité de l'information (Single Source of Truth)
pour tous les acteurs.
18
La séparation stricte entre la zone "Raw" (brute) et la zone "Curated" (nettoyée) structure la gouvernance : elle
permet d'absorber la complexité technique en amont sans la montrer aux utilisateurs métiers en aval,
garantissant que le marketing ou la finance ne consomment que des données fiabilisées. Enfin, en découplant
les sources de données (agences, web) des outils d'analyse (BI, IA), cette architecture assure la performance :
l'analyse de millions de lignes de réservations passées ne ralentira jamais les opérations de location en temps
réel aux comptoirs.
4. Le modèle d’information métier de l’entreprise
Voici le modèle conceptuel de données que nous proposons à OCKrent.
Nous justifions nos choix ci-dessous.
La gestion du parc et du catalogue
Lien AGENCE - VÉHICULE :
Ce lien est essentiel pour la logistique. Chaque véhicule physique doit être rattaché à une agence précise pour
que l'application mobile puisse le géolocaliser. Cela répond à l'objectif de "meilleure gestion de la flotte".
Lien CATÉGORIE - VÉHICULE :
C'est le lien technique. Il permet de classer les véhicules (ex : Clio, 208) dans des groupes standardisés (ex :
"Citadine"). Sans ce lien, impossible de proposer des véhicules équivalents si le modèle précis n'est pas dispo.
Lien CATÉGORIE - OFFRE_LOCATION :
C'est le lien marketing/digital. Sur le Web, on vend une promesse (une offre) sur un type de voiture (une
catégorie), pas une voiture précise. Ce lien permet de créer des promos ("offre été sur les SUV") sans devoir
modifier les milliers de fiches véhicules une par une.
19
Lien AGENCE - EMPLOYÉ
Ce lien relie les agences à ses employés. Une agence emploie un ou plusieurs employés.
Lien VÉHICULE - EMPLOYÉ
Ce lien relie les agences à ses employés. En effet, les véhicules sont gérés par les employés.
La gestion des réservations
Lien CLIENT - RÉSERVATION :
Ce lien permet l’identification de l'acteur de la transaction (le payeur/conducteur). Il permet de construire
l'historique client pour la vue 360°.
Lien VÉHICULE - RÉSERVATION :
Ce lien est critique pour OCKRent. Il est imposé qu'un véhicule ne soit réservé que "s’il n’y a aucune autre
réservation en cours dessus". Lier la réservation directement au véhicule (et non juste à la catégorie) permet
donc au système de vérifier le calendrier de la voiture en temps réel et d'éviter le surbooking.
Lien OFFRE_LOCATION - RÉSERVATION :
Ce lien "fige" le prix et les conditions. Il permet de savoir à quel tarif le client a réservé, même si le prix de l'offre
change le lendemain sur le site web.
Lien CLIENT – PERMIS DE CONDUIRE
Ce lien garantit qu’un client possède un unique permis de conduire. Il est impératif d’avoir un permis de conduire
pour chaque client pour rester dans un cadre légal.
La gestion des contrats et des finances
Lien RÉSERVATION - CONTRAT :
Ce lien permet de distinguer l'intention (Booking) de l'acte légal (Signature). Une réservation peut être annulée
(donc pas de contrat, d'où la cardinalité 0,1), mais un contrat vient obligatoirement d'une réservation. Le contrat
capture l'état réel du véhicule au départ.
20
Liens CONTRAT — FACTURE - TRANSACTION :
Ces liens assurent la traçabilité comptable. Le contrat validé (retour du véhicule) déclenche la facturation finale
(avec les pénalités éventuelles de retard/carburant), qui est ensuite payée par une transaction. Séparer ces
entités facilite la gestion des litiges (ex : facture émise mais paiement échoué).
Justification des liens absents
Ici, nous justifions l’absence de certains liens, volontairement absents d’après la logique que nous proposons à
OCKrent.
Absence lien direct CLIENT - VÉHICULE :
Un client n'est pas propriétaire de la voiture. La relation n'est que temporaire. Le lien passe par la Réservation.
Créer un lien direct ferait perdre l'information de "Quand ?" (date de location) et créerait une confusion avec le
propriétaire réel (l'Agence).
Absence de lien direct OFFRE - VÉHICULE :
Une offre s'applique à une famille de voitures (Catégorie), pas à une voiture unique (VIN). Si on liait l'offre au
véhicule, il faudrait recréer le lien pour chaque nouvelle voiture achetée, ce qui est ingérable. Le lien est transitif
via la Catégorie.
Absence de lien direct CLIENT - OFFRE ou CLIENT - CATÉGORIE :
Un client ne "possède" pas une offre ou une catégorie. Il l'utilise ponctuellement via une Réservation. L'historique
des offres consommées par le client se retrouve facilement en interrogeant ses réservations passées.
Absence de lien direct CONTRAT - CLIENT (redondance) :
Le contrat est lié à la réservation, qui est déjà liée au client. Ajouter un lien direct créerait une boucle inutile
(redondance) et un risque d'erreur de données (incohérence entre le client de la résa et le client du contrat). Le
système retrouve le client par transitivité.
Absence de lien direct AGENCE – OFFRE :
Dans un modèle "silos" (ancien système), chaque agence créait ses offres. Il fallait donc un lien. Mais dans
l’approche de centralisation, la tendance est aux offres nationales ou régionales gérées par le Siège. L'offre "Été
2025" est créée au niveau central et s'applique à la catégorie "Cabriolet", par exemple. Toutes les agences qui
ont des cabriolets peuvent proposer l'offre via le lien Agence -> Véhicule -> Catégorie -> Offre.
21
4.1 Le Modèle Physique de Données (MPD) Cible
Après avoir établi la vision métier à travers le Modèle Conceptuel, la dernière étape de modélisation consiste à
traduire ces règles de gestion en spécifications techniques exécutables. C’est le rôle du Modèle Physique de
Données (MPD), qui sert de plan de construction direct pour les ingénieurs de données et les administrateurs de
bases de données.
Le passage au modèle physique est indispensable pour ancrer la transformation Data d’OCKRent dans la réalité
opérationnelle. Là où le modèle conceptuel décrit le "Quoi" (les entités métier), le MPD définit le "Comment" (le
stockage et la performance). Il a pour but de :
 Garantir l'intégrité des données : En définissant strictement les clés primaires (PK) et les clés étrangères
(FK), nous nous assurons qu'aucune réservation ne peut être créée sans client valide, ou qu'un véhicule
ne peut être orphelin d'agence.
 Sécuriser la qualité à la source : Le typage précis des champs (VARCHAR, INT, DATE) et les contraintes
d'unicité (ex: sur l'email client ou le VIN véhicule) agissent comme un premier rempart contre les
données de mauvaise qualité.
 Optimiser les performances : Des choix d'architecture, comme la dénormalisation de certaines
informations du modèle de véhicule directement dans la table T_VEHICULE, ont été faits pour simplifier
les requêtes de lecture fréquentes sur le site web et l'application mobile.
Méthodologie : L'approche "Code-First" avec Mermaid
Pour la conception de ce schéma, nous avons opté pour l'utilisation du langage Mermaid. Ce choix
méthodologique n'est pas anodin dans un contexte de transformation moderne :
1. Agilité et Maintenabilité : Contrairement aux diagrammes statiques classiques, le modèle est défini
sous forme de code. Cela permet de le versionner, de le modifier rapidement lors des ateliers avec le
métier, et de garantir qu'il reste toujours à jour.
`
2. Cohérence visuelle : L'outil permet de structurer visuellement les différents domaines fonctionnels
(Client, Flotte, Finance) via un code couleur, facilitant la lecture pour les équipes non techniques tout
en conservant la rigueur nécessaire aux développeurs.
Structure du Modèle
Le MPD proposé structure le système d'information cible autour des piliers identifiés (Client, Employé, Vehicule
et Agences). Il matérialise les règles de consolidation (pour la vue 360° Client) et de centralisation (pour le
catalogue Véhicule) définies dans la stratégie de gouvernance. Il constitue le socle technique sur lequel
reposeront les flux d'alimentation du futur Data Lake et les APIs opérationnelles.
22
23
5. Cas d'usage et Valorisation de la Donnée
L'architecture cible et les référentiels définis précédemment ne sont pas une fin en soi, mais le socle nécessaire
pour transformer OCKRent en une entreprise pilotée par la donnée ("Data Driven").
Jusqu'à présent, la fragmentation des données empêchait toute analyse transverse. La mise en place du Data
Lake, alimenté par nos nouveaux référentiels unifiés (Client, Produit, Réservation, Employé) et enrichi par des
données externes, permet désormais de déployer des cas d'usage à très forte valeur ajoutée.
Nous avons identifié quatres cas d'usage prioritaires. Ils répondent aux problématiques critiques de l'entreprise
: l'optimisation des ressources, la maximisation du chiffre d'affaires et la garantie de la sécurité des véhicules.
Optimisation des Ressources Agence (Staffing & Flotte)
Actuellement, le pilotage de l'activité en agence est réactif et non anticipatif. Les chefs d'agence manquent de
visibilité sur les pics d'activité réels, ce qui entraîne deux risques majeurs :
1. Sous-effectif au comptoir : Files d'attente interminables lors des pics imprévus, dégradant l'expérience
client.
2. Indisponibilité de véhicules : Manque de véhicules prêts (nettoyés/préparés) face à une demande locale
soudaine.
Ce cas d'usage vise à lier directement le volume prévisionnel de travail aux ressources humaines et matérielles,
pour garantir qu'il y ait "assez de voitures et assez d'agents le jour J".
Description du Flux de Données (Data Pipeline)
Tel qu'illustré dans le schéma d'architecture fonctionnelle :
 1. Les Entrées (Inputs) : Le modèle ingère des données Internes issues des opérations :
24
o Réservation : Volume des départs et retours prévus (charge de travail brute).
o Employé : Planning actuel et compétences disponibles.
o Produit : État du stock de véhicules par agence. Ces données sont croisées avec des données
Achetées (Externes) pour affiner la prévision :
o Météo : Impacte le temps de préparation (lavage plus long s'il pleut) et les comportements
clients (retards).
o Event : Les grands événements (concerts, salons) expliquent les pics de demande atypiques
que l'historique seul ne peut prédire.
 2. Le Traitement (Data Lake & Gold) : Les données brutes (Raw) sont consolidées dans le Data Lake. Un
algorithme prédictif calcule la charge de travail estimée (temps moyen par contrat x volume prévisionnel
pondéré par la météo/événements).
 3. La Sortie (Output & Action) : Le résultat est une donnée "GOLD" à haute valeur ajoutée exposée sous
deux formes :
o RH : Un planning optimisé suggérant les ajustements d'effectifs.
o Logistique : Une recommandation de transfert de flotte inter-agences (déplacer des véhicules
d'une agence en sureffectif vers une agence en sous-effectif) avant que la pénurie ne
survienne.
Le Yield Management (Tarification Dynamique)
Dans le modèle actuel, les prix sont fixés de manière statique ou via des processus manuels lents (fichiers
Excel/PPT). Cela empêche OCKRent de réagir à l'agressivité tarifaire de la concurrence ou aux opportunités de
forte demande. L'enjeu est financier : il s'agit de maximiser le revenu par véhicule (RevPAR) en augmentant les
prix quand la demande est forte et en les baissant pour écouler le stock quand elle est faible.
Description du Flux de Données (Data Pipeline)
Ce cas d'usage transforme la stratégie commerciale grâce à l'automatisation :
 1. Les Entrées (Inputs) : Le système s'appuie sur une combinaison précise de données Internes :
o Réservation : Historique et rythme actuel de remplissage (Montée en charge).
o Produit : Le stock disponible en temps réel (la rareté fait le prix).
25
o Client : Segmentation (Business vs Loisir) pour évaluer la sensibilité au prix. Pour être pertinent,
le modèle intègre des données Achetées critiques :
o Concurrents : Le scraping des prix du marché (Hertz, Avis, etc.) pour positionner OCKRent
intelligemment.
o Météo & Event : Facteurs contextuels influençant la demande spontanée.
 2. Le Traitement (Data Lake & Gold) : Le moteur de règles (Algorithme de Pricing) analyse l'élasticité-
prix. Si le stock baisse vite et que les concurrents sont chers (effet "Event"), l'algorithme calcule un
nouveau prix optimal.
 3. La Sortie (Output & Action) : L'action est une prescription automatique : la mise à jour du tarif dans
la fiche Produit. Ce nouveau prix est instantanément visible par le Client sur le Web et par l'Employé en
agence, garantissant une cohérence omnicanale.
Maintenance Prédictive & Sécurité
La qualité et la sécurité sont des fondamentaux non négociables. Aujourd'hui, un véhicule peut être loué alors
qu'une défaillance technique mineure est présente mais non détectée, ou qu'une révision est imminente. Cela
génère des pannes client, des coûts de dépannage élevé et une image de marque dégradée. L'objectif est
purement opérationnel : anticiper la panne avant qu'elle n'arrive et bloquer la location préventivement.
Description du Flux de Données (Data Pipeline)
Contrairement aux deux précédents, ce cas d'usage est purement interne et technique (pas de données
Météo/Event) :
 1. Les Entrées (Inputs) : Nous croisons trois sources de données Internes :
o Produit (Données Techniques) : Âge du véhicule, kilométrage, date du dernier contrôle.
o Télémétrie / IoT : C'est l'apport majeur de la modernisation. Les boîtiers connectés des
véhicules remontent des codes d'erreur en temps réel (pression pneus, batterie, usure
plaquettes) indépendamment du kilométrage.
o Réservation : Statut actuel du véhicule (est-il sur la route ? quand revient-il ?).
 2. Le Traitement (Data Lake & Gold) : Le Data Lake ingère ces signaux faibles. Le traitement consiste à
comparer les données IoT et kilométriques aux règles de sécurité constructeur. Exemple : Si "Code Erreur
Frein = Vrai" OU "Km > Seuil Révision", alors Risque = Critique.
 3. La Sortie (Output & Action) : Le système génère une alerte de sécurité qui déclenche deux actions
simultanées :
o Blocage : Le véhicule passe automatiquement en statut "Indisponible" dans le Référentiel
Produit, empêchant toute nouvelle réservation (Web ou Agence).
26
o Notification : Une demande d'intervention est envoyée directement à l'atelier (Employé) pour
prise en charge immédiate.
Cas Transverse : Prévision Avancée de la Demande
Le "pilotage difficile de l'activité" mentionné dans le diagnostic initial provient d'une gestion basée uniquement
sur le passé (historique N-1). Les directeurs d'agence naviguent souvent "à vue", sans outil pour anticiper les
variations brusques de fréquentation. Ce cas d'usage est le fondement de l'approche Data Driven : il s'agit de
construire un modèle de prévision fiable capable de dire "combien de clients aurons-nous demain ?", en ne se
basant plus seulement sur ce qui s'est passé hier, mais sur ce qui va se passer (événements, météo).
Description du Flux de Données (Data Pipeline) Ce schéma illustre la construction de la donnée "GOLD" de
prévision, qui sert de boussole à l'entreprise :
 1. Les Entrées (Inputs) :
o Le système ingère les données historiques et actuelles de Réservation et l'état du parc
Véhicules par Agence.
o Ces données internes sont systématiquement croisées avec des flux externes (Météo et Event)
pour contextualiser la donnée. Exemple : Une hausse de réservation l'an dernier à la même
date n'est pertinente que si l'on sait qu'il faisait beau et qu'il y avait un salon professionnel ce
jour-là.
 2. Le Traitement (Data Lake & Gold) :
o Le Data Lake centralise ces sources hétérogènes ("raw"). Le traitement analytique nettoie ces
données et applique des modèles statistiques pour générer une "Prévision des réservations"
(GOLD). C'est une donnée consolidée et purifiée qui projette le volume d'activité futur.
 3. La Sortie (Output & Action) :
o La finalité est la Data Visualisation ("Data Viz"). Cette prévision est exposée sous forme de
tableaux de bord interactifs pour la Direction Générale et les Directeurs de Réseau. Elle permet
27
de visualiser les tendances à venir et d'identifier les écarts entre le budget prévisionnel et la
réalité du terrain anticipée.
6. Gestion des Métadonnées et Data Catalog
La transformation d'OCKRent repose sur la capacité à fusionner des systèmes d'information cloisonnés pour
alimenter une nouvelle plateforme digitale unique. Cependant, l'analyse de l'existant révèle une opacité majeure
: les règles de gestion sont enfermées dans des fichiers Excel locaux ou des présentations PowerPoint, et les
structures de données varient entre les systèmes régionaux (Lavande, Tulipe).
Dans ce contexte, la mise en place d'un Data Catalog est un prérequis absolu au chantier de centralisation. Il ne
s'agit pas seulement d'un inventaire technique, mais de la construction d'une cartographie dynamique
permettant de localiser, comprendre et maîtriser le patrimoine de données avant même de tenter de le migrer
ou de le nettoyer. Comme le soulignent Gartner et Talend, cet outil est indispensable pour réduire le "Time to
Market" des nouveaux cas d'usage : sans lui, les développeurs de l'application mobile perdront des semaines à
chercher dans quelle table du système "Tulipe" se trouve le kilométrage réel d'un véhicule.
Concrètement, le Data Catalog devra remplir une fonction première de découverte et d'inventaire
automatisé. En utilisant ses connecteurs et ses fonctionnalités de "scan", l'outil va se connecter aux bases de
données régionales ainsi qu'aux sources non structurées identifiées comme critiques, notamment les fichiers
Excel de gestion des agences. Cela permettra de constituer automatiquement un Dictionnaire de
Données technique, documentant les formats et les contraintes techniques de chaque champ. Par exemple, cela
mettra en évidence que le champ "Statut Véhicule" est codé sur 1 caractère dans le Nord mais sur 3 caractères
dans le Sud, une information vitale pour les architectes chargés de concevoir le modèle cible du Data Lake.
Au-delà de la technique, le Data Catalog doit servir de support à la définition sémantique commune via
un Glossaire Métier. Actuellement, une "offre" est définie par un slide PowerPoint au marketing, tandis qu'elle
correspond à une ligne de facturation pour la comptabilité. Le catalogue permettra de réconcilier ces visions en
associant une définition métier unique et partagée aux données techniques. Cela garantira que lorsque la
Direction Générale demandera un rapport sur le "Taux d'occupation", cet indicateur sera calculé de la même
manière pour une agence bretonne et une agence provençale, en se basant sur des métadonnées fiables et
documentées. C'est ce contexte qui permettra aux Data Scientists de comprendre les datasets pour leurs futurs
modèles d'optimisation de la flotte.
Enfin, le Data Catalog est l'outil qui sécurisera la conformité et la traçabilité dans le nouveau système
centralisé. Grâce aux fonctionnalités de Data Lineage, nous pourrons visualiser graphiquement le flux de la
donnée, depuis sa saisie sur la tablette en agence jusqu'à son apparition dans le reporting financier consolidé.
Si une incohérence de chiffre d'affaires est détectée, le Data Steward pourra remonter la chaîne de
transformation en quelques clics pour identifier l'origine de l'erreur. De plus, dans le cadre de l'ouverture du site
web et de la collecte de données clients (permis, identité), le catalogue permettra d'automatiser la gouvernance
via le tagging (étiquetage). Les données identifiées comme sensibles ou personnelles (PII) seront taguées
directement dans le catalogue, déclenchant automatiquement les politiques de sécurité et de restriction d'accès
nécessaires pour respecter le RGPD.
28
7. Les règles de data quality sur les données critiques
L'objectif est de sécuriser la transformation digitale et la centralisation des systèmes d'information. Pour ce faire,
voici le process de data quality que suivront les données d’OCKrent.
Phase Discover : diagnostic et compréhension des anomalies
Avant de définir les règles cibles, il est impératif d'analyser l'existant pour comprendre la nature des données
manipulées par les agences régionales. Actuellement, OCKRent souffre d'une fragmentation de son patrimoine
de données, dispersé entre les systèmes régionaux (Lavande, Tulipe, Acacia, IRIS) et des fichiers bureautiques
non maîtrisés (Excel, PPT).
Cette phase de profilage des données a mis en lumière des anomalies critiques qui bloquent la centralisation.
Premièrement, sur le périmètre Client, nous observons une forte redondance non gérée : un même client peut
exister sous des identifiants différents dans le système "Lavande" (Nord) et "Tulipe" (Sud), empêchant toute
vision unique.
Deuxièmement, la gestion des Agences via Excel a entraîné une hétérogénéité des formats d'adresses et
d'horaires, rendant impossible leur exploitation directe par une application mobile standardisée.
Enfin, sur la flotte de véhicules, l'absence de contrôles stricts a permis la saisie de valeurs aberrantes (outliers),
comme des kilométrages incohérents, faussant la valorisation du parc de véhicules.
Phase Define : Définition des règles et seuils de qualité
Cette phase constitue le cœur du plan d'action. Nous devons traduire les exigences métiers en règles techniques
précises pour les quatre objets de données critiques identifiés (Véhicule, Agence, Client, Réservation). Ces règles
s'appuient sur les dimensions standards de la qualité (Complétude, Validité, Unicité, Cohérence, Précision,
Fraîcheur).
Client
L'enjeu majeur est ici la création du "Golden Record" lors de la fusion des bases régionales. Le marketing doit
pouvoir adresser un client unique quel que soit son historique de location. De plus, la digitalisation du parcours
(réservation en ligne) exige des données de contact fiables pour la confirmation et la facturation.
Dimension Règle de Gestion & Description Objectif & KPIs Mesure & Technique
Règle de fusion des doublons.
Objectif : 100% (sur
le Golden Record
final)
Unicité
(Uniqueness)
Mesure : Semi-
automatique. Le système
propose des "paires
candidates", la fusion
finale nécessite la
validation d'un Data
Steward.
Deux fiches clients issues de systèmes
différents (ex: Lavande vs Tulipe) doivent
être fusionnées en un "Golden Record" s'il y
a concordance stricte sur le triplet {Nom +
Prénom + Date de Naissance} ou sur
le {Numéro de Permis}.
Note : Tolérance 0
sur les doublons
après fusion.
Technique : Data
Deduplication (Fuzzy
matching algorithms)
29
Dimension Règle de Gestion & Description Objectif & KPIs Mesure & Technique
Objectif : 85%
Champs obligatoires "Digital".
Complétude
(Completeness)
Un profil client est considéré comme "Digital
Ready" si les champs Email, Téléphone
Mobile et Numéro de Permis sont
renseignés.
Note : On accepte
que 15% des vieux
clients inactifs
n'aient pas d'email,
mais 100% des
nouveaux doivent
l'avoir.
Mesure : Automatique et
temps réel lors d’une
saisie sur le Web / Batch
mensuel de profiling sur
la base existante.
Technique : Data
Profiling / Schema check
(NOT NULL)
Format de l'email.
Objectif : 98%
Mesure : Automatique et
bloquant lors de la
création d'un compte
Web.
Validité
(Validity)
L'adresse email doit respecter la syntaxe
standard (contient "@" et un domaine
valide) pour assurer l'envoi de la facture
électronique.
Note : Tolérance
pour les erreurs de
frappe historiques.
Technique : Règles de
validation pour les saisies
(Regex)
Agence
La fiabilité des données "Agence" est un prérequis absolu. Si un client ne peut pas géolocaliser l'agence ou se
présente devant une porte close à cause d'horaires erronés sur l'application mobile, l'expérience client est
détériorée et la vente compromise. Nous devons sortir de la logique "Excel" pour imposer une structure
rigoureuse.
Dimension Règle de Gestion & Description Objectif & KPIs Mesure & Technique
Coordonnées GPS.
Objectif : 100%
Complétude
(Completeness)
Toute agence doit posséder
une Latitude et
une Longitude pour apparaître
sur la carte de l'application
mobile.
Note : Donnée critique
pour le lancement de l'App.
Mesure : Automatique à
l'ajout d'une nouvelle
agence au référentiel.
Technique : Schema check
Objectif : 95%
Cohérence Code Postal / Ville.
Précision
(Accuracy)
Le couple {Code Postal, Ville}de
l'agence doit exister dans le
référentiel national des adresses
(BNA).
Note : Les 5% restants
correspondent souvent à
des lieux-dits ou zones
industrielles spécifiques.
Mesure : Automatique
déclenché une fois par
trimestre pour vérifier les
changements de code
postaux.
Technique : Cross validation
(avec référentiel externe)
30
Véhicule
Le véhicule est l'actif physique au cœur du revenu. Une erreur sur le statut d'un véhicule (marqué disponible
alors qu'il est en panne) entraîne un surbooking et une insatisfaction client majeure. La qualité des données
"Produit" doit garantir que ce qui est vendu sur le Web est réellement disponible sur le parc.
Règle de Gestion & Description Cohérence Maintenance / Disponibilité.
Dimension Objectif & KPIs Mesure & Technique
Objectif : 100%
Cohérence
(Consistency)
Le nombre de véhicules avec un statut
commercial "DISPONIBLE" doit être
strictement égal au nombre total de
véhicules MOINS ceux ayant un ticket de
maintenance ouvert ou un statut "LOUÉ".
Note : Critique
pour le revenu.
Mesure : Automatique
déclenché tous les jours à
20h (avant les batchs de
réservation).
Technique : Cross validation
(Entre tables Parc et
Maintenance)
Objectif : 90%
Fraîcheur
(Timeliness)
Mise à jour du retour véhicule.
Le changement de statut de "LOUÉ" à "PRÊT"
doit être effectif dans le système central
maximum 30 minutes après la validation de
la tablette de retour par l'agent.
Note : On tolère
10% de délais
(problèmes réseau,
pic d'activité).
Mesure : Semi-
automatique. Rapport
hebdomadaire envoyé aux
Chefs d'Agence sur les
délais moyens.
Technique : Data freshness
analysis (Comparaison
Timestamp Tablette vs
Timestamp Serveur)
Validité
(Validity)
Conformité du VIN.
Le Numéro de Série (VIN) doit comporter 17
caractères alphanumériques.
Objectif : 100%
Mesure : Automatique et
temps réel lors de
l'intégration d'un véhicule
(achat).
Technique : Pattern
Matching
Réservation
La donnée de réservation est le lien contractuel. Elle doit garantir l'intégrité du chiffre d'affaires. Les règles ici
visent à empêcher les incohérences temporelles ou relationnelles qui bloqueraient la facturation ou la délivrance
du véhicule.
Dimension Règle de Gestion & Description Objectif & KPIs Mesure & Technique
Objectif : 100%
Précision
(Accuracy)
Chronologie de la réservation.
L'heure de déclaration du début d'une
réservation doit être strictement
antérieure à l'heure de fin déclarée.
Note : Règle
physique
inviolable.
Mesure : Contrôle automatique
déclenché par l'API de réservation
lors de la validation du formulaire.
Technique : Data Validation rules à
la saisie
Intégrité
(Referential
Integrity)
Existence du Client.
Mesure : Automatique temps réel
(Foreign Key constraint).
Objectif : 100%
31
Dimension Règle de Gestion & Description Objectif & KPIs Mesure & Technique
Toute réservation doit pointer vers
un ID_Client existant et actif dans le
MDM Client.
Technique : Referential integrity
check
Phase Integrate : Déploiement et automatisation
La définition des règles ne suffit pas ; elles doivent être intégrées techniquement dans le nouveau système
d'information pour être opérantes. Pour OCKRent, nous recommandons une approche préventive dite
de "Quality at Source" (Qualité à la source).
Concrètement, cela signifie que les règles critiques définies ci-dessus (notamment les formats et les champs
obligatoires) doivent être implémentées directement dans les contrôles des nouvelles APIs. Lorsqu'un client saisit
ses informations sur l'application mobile, l'API doit rejeter immédiatement une saisie invalide (ex : email
incorrect) avec un message d'erreur clair. Pour les flux de données provenant des systèmes existants (Lavande,
Tulipe), des processus de nettoyage (Data Cleansing) seront intégrés dans les chaînes d'alimentation (ETL) pour
transformer et normaliser les données avant leur chargement dans les nouveaux référentiels centraux.
Phase Monitor : Pilotage et amélioration continue
Enfin, la qualité des données n'est pas un état acquis mais un processus continu. La phase de monitoring vise à
surveiller l'évolution de la qualité dans le temps et à prévenir toute dégradation.
Nous préconisons la mise en place de tableaux de bord de Qualité des Données (DQ Dashboards) à destination
des Data Stewards et des Data Owners. Ces tableaux de bord remonteront les indicateurs clés (KPIs) définis dans
la phase "Define" (ex : taux de doublons, taux de complétude des fiches agences). En cas de dérive ou de
détection d'anomalie (par exemple, un pic de véhicules avec des kilométrages incohérents), un processus d'alerte
et de remédiation sera déclenché, permettant aux équipes opérationnelles d'intervenir rapidement pour corriger
les données à la source.
7.1. Politique de Sécurité, Confidentialité et Conformité
des Données
La centralisation des données au sein du nouveau Data Lake OCKRent (zones Raw et Curated) et l'exploitation de
nouvelles sources (IoT, Télémétrie, RH) imposent un durcissement drastique des règles de sécurité. Cette section
détaille les mesures techniques et organisationnelles pour protéger les actifs critiques et assurer la conformité
RGPD, alignées sur la phase de "Renforcement Continu" de la roadmap.
Classification et Niveaux de Sensibilité
Pour appliquer les bonnes mesures de sécurité, chaque typologie de donnée intégrée dans l'architecture est
classifiée selon son niveau de sensibilité :
 C0 - Publique : Données accessibles à tous (ex: Catalogue des véhicules, Adresses des agences, Météo).
32
 C1 - Interne : Données métier non sensibles (ex: Statistiques globales de maintenance, inventaire flotte).
 C2 - Confidentielle (Business) : Données stratégiques de l'entreprise (ex: Algorithmes de tarification
dynamique, stratégie concurrentielle, CA détaillé par agence).
 C3 - Sensible / Personnelle (RGPD & RH) : Données identifiant directement ou indirectement une
personne. Cela inclut :
o Clients : Identité, permis, historique, coordonnées bancaires.
o Employés : Plannings, performances individuelles.
o Télémétrie Véhicule : Géolocalisation et comportement de conduite (assimilé à de la donnée
personnelle tant qu'elle est reliée à une réservation).
Règles de Protection dans l'Architecture Data Lake
L'architecture cible repose sur une ségrégation stricte entre les zones de stockage pour garantir la sécurité "by
design" :
Sécurisation de la Zone Brute ("Raw Data")
 Chiffrement au repos : Toutes les données ingérées (Clients, Télémétrie, Employés) sont chiffrées dès
leur stockage (AES-256).
 Accès restreint : L'accès à la zone Raw est strictement interdit aux utilisateurs métiers et aux outils de
BI standards. Seuls les Data Engineers et Administrateurs habilités y accèdent pour la maintenance des
flux ETL/ELT.
Anonymisation vers la Zone Nettoyée ("Curated Data")
 Pseudonymisation systématique : Avant d'être transférées vers la couche Curated accessible pour
l'analytique (Prévision des réservations, Pricing), les données identifiantes doivent être hachées ou
tokenisées.
Exemple : Pour l'étude "Tarification Dynamique", le nom du client est remplacé par un ID unique (ex:
USR_8945), permettant l'analyse comportementale sans exposer l'identité.
 Purge des données sensibles : Les données de cartes bancaires ou de santé (si applicable employés) ne
doivent jamais transiter vers la zone analytique.
33
Gestion des Identités et des Accès (IAM)
 Conformément à la couche "Gouvernance & Sécurité" de l'architecture, le principe du moindre privilège
s'applique :
 Un Data Scientist travaillant sur la "Maintenance Prédictive" n'a accès qu'aux données techniques des
véhicules, sans accès aux données clients ou employés.
 Un Manager RH n'accède qu'aux données "Employés" de sa région, sans visibilité sur la télémétrie client.
 L'authentification multifacteur (MFA) est requise pour tout accès administrateur au Data Lake.
Règles de conformité aux Données Critiques
Données Clients et Télémétrie (IoT)
 L'intégration de la télémétrie pour la maintenance prédictive soulève un risque majeur de surveillance.
 Règle de finalité : Les données GPS/IoT ne doivent être utilisées que pour l'état technique du véhicule
et la sécurité. Toute utilisation pour profiler les déplacements du client à des fins commerciales est
interdite sans consentement explicite et distinct.
 Durée de rétention courte : Les données de géolocalisation précises doivent être purgées ou
généralisées (floutage géographique) dès la fin du contrat de location et la validation de l'état des lieux.
Données Employés (RH)
 L'optimisation des plannings manipule des données RH.
 Cloisonnement : Ces données doivent être stockées dans un "Data Mart" sécurisé, isolé des données
commerciales.
 Droit d'opposition : Les employés doivent être informés de l'utilisation de leurs données de performance
pour l'optimisation algorithmique des plannings (transparence des algorithmes).
Gouvernance de la Conformité et Audit
 Registre des traitements : Chaque cas d'usage (Prévision, Pricing, Maintenance, Planning) doit être
inscrit au registre RGPD tenu par le DPO.
 Analyse d'Impact (DPIA) : Une analyse d'impact est obligatoire avant la mise en production du module
de "Maintenance Prédictive & Sécurité" en raison du traitement à grande échelle de données de
localisation (IoT).
 Traçabilité (Audit Logs) : Chaque requête effectuée sur le Data Lake (qui a consulté quoi et quand) est
journalisée et conservée 1 an pour permettre des audits de sécurité et la détection de fuites de données.
34
Conclusion Générale
La mission de conseil menée auprès d'OCKRent a mis en évidence l'impératif stratégique de rompre avec le
modèle historique de gestion en silos régionaux pour transformer l'entreprise en une organisation unifiée et
pilotée par la donnée. L'analyse initiale a confirmé que la fragmentation des systèmes d'information existants,
symbolisée par la coexistence de solutions hétérogènes comme Lavande ou Tulipe et la persistance de processus
manuels via Excel, constituait un frein majeur aux ambitions digitales du groupe. Pour répondre à ce défi et
sécuriser le déploiement des nouveaux canaux web et mobiles, nous avons défini un cadre de transformation
global structuré autour d'une gouvernance forte, d'une architecture technologique résiliente et d'une gestion
rigoureuse de la qualité des données.
Cette mutation repose en premier lieu sur l'instauration d'un framework de Data Gouvernance centralisé de type
« Hub & Spoke », indispensable pour mettre fin à l'autonomie des agences et garantir l'unicité de l'information
à travers le réseau. La définition précise des rôles, du Chief Data Officer aux Data Stewards, ainsi que l'application
de principes directeurs tels que le « Golden Record » et la « Qualité à la Source », assurent désormais que la
donnée est gérée comme un actif stratégique partagé et non plus comme un sous-produit administratif local.
Sur le plan technologique, la cible architecturale marque une rupture nécessaire avec le passé en remplaçant les
systèmes cloisonnés par une architecture Data Lake moderne couplée à une logique d'API, permettant de
réconcilier les impératifs opérationnels de temps réel, comme la vérification instantanée de la disponibilité des
véhicules, avec les besoins d'analyse approfondie.
La fiabilisation du patrimoine informationnel d'OCKRent est assurée par la modélisation et la mise en œuvre de
quatre Référentiels Maîtres critiques — Client, Véhicule, Agence et Réservation — pour lesquels des règles de
qualité strictes ont été établies afin de garantir l'intégrité des opérations de facturation et de pilotage. Cette
refonte structurelle trouve sa finalité dans la valeur économique qu'elle génère, illustrée par le déploiement de
cas d'usage à fort impact tels que le Yield Management pour l'optimisation tarifaire, la maintenance prédictive
via l'IoT pour la sécurité de la flotte, ou encore l'optimisation des ressources en agence. En suivant la feuille de
route établie sur 18 mois, OCKRent dispose désormais de toutes les clés pour réussir sa transition d'un loueur
traditionnel fragmenté vers un leader digital intégré, capable d'innover et d'offrir une expérience client fluide et
personnalisée sur l'ensemble du territoire.
35
