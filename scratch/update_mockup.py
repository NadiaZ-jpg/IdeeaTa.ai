import re

file_path = r"d:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest\components\MockupPreview.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Tab Titles
content = content.replace("['Rezumat', 'SWOT', 'Buget', 'Strategie']", "[ui.mockupSummary, ui.mockupSwot, ui.mockupBudget, ui.mockupStrategy]")
content = content.replace("innerMockupTab === 'Rezumat'", "innerMockupTab === ui.mockupSummary")
content = content.replace("innerMockupTab === 'SWOT'", "innerMockupTab === ui.mockupSwot")
content = content.replace("innerMockupTab === 'Buget'", "innerMockupTab === ui.mockupBudget")
content = content.replace("innerMockupTab === 'Strategie'", "innerMockupTab === ui.mockupStrategy")

# Summary Tab
content = content.replace("Exemplu generat", "{ui.generatedExample}")
content = content.replace("Cafenea de Specialitate &quot;Urban Beans&quot;", "{ui.coffeeShopName}")
content = content.replace("<strong>Urban Beans</strong> este o cafenea de specialitate modernă, situată în inima centrului istoric. Ne propunem să oferim nu doar cafea de origine prăjită local, ci și o experiență senzorială completă, într-un mediu cu un design industrial minimalist.", "<strong>Urban Beans</strong> {ui.mockupSummaryP1}")
content = content.replace("Misiunea noastră este să educăm consumatorii despre procesul de la bob la ceașcă, sprijinind fermierii independenți prin comerț echitabil (Fairtrade).", "{ui.mockupSummaryP2}")
# Handling unicode and HTML entities in the existing text just in case:
# Let's use regex for safer replacement of the paragraphs.

content = re.sub(r"<strong>Urban Beans<\/strong>.*?(?=<\/p>)", r"<strong>Urban Beans</strong> {ui.mockupSummaryP1}", content, flags=re.DOTALL)
content = re.sub(r"<p>[\s]*Misiunea noastr.*?(?=<\/p>)", r"<p>\n                  {ui.mockupSummaryP2}\n                ", content, flags=re.DOTALL)

# SWOT Tab
content = content.replace("Puncte Tari", "{ui.mockupSwotS_Title}")
content = content.replace("Locație premium cu trafic pietonal intens", "{ui.mockupSwotS_1}")
content = content.replace("Baristi certificați SCA (Specialty Coffee Association)", "{ui.mockupSwotS_2}")
content = content.replace("Exclusivitate pentru un prăjitor local renumit", "{ui.mockupSwotS_3}")
content = content.replace("Puncte Slabe", "{ui.mockupSwotW_Title}")
content = content.replace("Costuri mari de chirie în zona centrală", "{ui.mockupSwotW_1}")
content = content.replace("Lipsa unei istorii/notorietăți pe piață (brand nou)", "{ui.mockupSwotW_2}")
content = content.replace("Prețuri mai mari față de lanțurile comerciale", "{ui.mockupSwotW_3}")
content = content.replace("Oportunități", "{ui.mockupSwotO_Title}")
content = content.replace("Creșterea cererii pentru cafea de specialitate", "{ui.mockupSwotO_1}")
content = content.replace("Parteneriate B2B cu birourile din zonă", "{ui.mockupSwotO_2}")
content = content.replace("Lansarea unui abonament lunar pentru boabe de cafea", "{ui.mockupSwotO_3}")
content = content.replace("Amenințări", "{ui.mockupSwotT_Title}")
content = content.replace("Fluctuația prețului cafelei verzi pe bursa globală", "{ui.mockupSwotT_1}")
content = content.replace("Deschiderea unei noi francize majore în apropiere", "{ui.mockupSwotT_2}")
content = content.replace("Reticența clienților tradiționaliști la cafeaua acidă/fructată", "{ui.mockupSwotT_3}")

# Clean up diacritics issues if any
content = re.sub(r"Loca\?ie premium cu trafic pietonal intens", "{ui.mockupSwotS_1}", content)
content = re.sub(r"Baristi certifica\?i SCA \(Specialty Coffee Association\)", "{ui.mockupSwotS_2}", content)
content = re.sub(r"Exclusivitate pentru un pr.jitor local renumit", "{ui.mockupSwotS_3}", content)
content = re.sub(r"Costuri mari de chirie .n zona central.", "{ui.mockupSwotW_1}", content)
content = re.sub(r"Lipsa unei istorii/notorieta\?i pe pia\?a \(brand nou\)", "{ui.mockupSwotW_2}", content)
content = re.sub(r"Pre\?uri mai mari fa\?a de lan\?urile comerciale", "{ui.mockupSwotW_3}", content)
content = re.sub(r"Oportunita\?i", "{ui.mockupSwotO_Title}", content)
content = re.sub(r"Cre\?terea cererii pentru cafea de specialitate", "{ui.mockupSwotO_1}", content)
content = re.sub(r"Parteneriate B2B cu birourile din zona", "{ui.mockupSwotO_2}", content)
content = re.sub(r"Lansarea unui abonament lunar pentru boabe de cafea", "{ui.mockupSwotO_3}", content)
content = re.sub(r"Amenin\?ari", "{ui.mockupSwotT_Title}", content)
content = re.sub(r"Fluctua\?ia pre\?ului cafelei verzi pe bursa globala", "{ui.mockupSwotT_1}", content)
content = re.sub(r"Deschiderea unei noi francize majore .n apropiere", "{ui.mockupSwotT_2}", content)
content = re.sub(r"Reticen\?a clien\?ilor tradi\?ionali\?ti la cafeaua acida/fructata", "{ui.mockupSwotT_3}", content)

# Budget Tab
content = re.sub(r"Buget de Investi\?ii Ini\?iale", "{ui.mockupBudgetTitle}", content)
content = re.sub(r"Echipamente \(Espressor, R.\?ni\?e\)", "{ui.mockupBudgetEq}", content)
content = re.sub(r"Amenajare loca\?ie &amp; Design", "{ui.mockupBudgetDes}", content)
content = re.sub(r"Stoc ini\?ial marfa &amp; Consumabile", "{ui.mockupBudgetStock}", content)
content = re.sub(r"Total Investi\?ie Estimata", "{ui.estimatedTotal}", content)

# Strategy Tab
content = content.replace("Pre-lansare &amp; Teasing", "{ui.mockupStrategy1_Title}")
content = content.replace("Campanie Social Media axata pe procesul de amenajare, prezentarea echipei de baristi ?i dezvaluirea prajitorului partener.", "{ui.mockupStrategy1_Desc}")
content = content.replace("Soft Opening", "{ui.mockupStrategy2_Title}")
content = content.replace("O saptamna dedicata exclusiv comunita?ii locale ?i influencerilor din ni?a culinara, cu un meniu limitat la 50% reducere.", "{ui.mockupStrategy2_Desc}")

content = re.sub(r"Campanie Social Media axata pe procesul de amenajare, prezentarea echipei de baristi .\?i dezvaluirea prajitorului partener.", "{ui.mockupStrategy1_Desc}", content)
content = re.sub(r"O saptam.na dedicata exclusiv comunita\?ii locale .\?i influencerilor din ni\?a culinara, cu un meniu limitat la 50% reducere.", "{ui.mockupStrategy2_Desc}", content)

# Live Typing Tab
content = content.replace("# Plan de Afaceri - Cafenea de Specialitate &quot;Urban Beans&quot;", "{ui.mockupLiveTitle}")
content = content.replace("Genernd proiec?ii financiare (n LEI)...", " {ui.mockupLiveGen}")
content = re.sub(r"Gener.nd proiec\?ii financiare \(.n LEI\)...", " {ui.mockupLiveGen}", content)

content = content.replace("## Venituri Estimate", "{ui.mockupLiveRev}")
content = re.sub(r"- Trimestrul 1: 150\.000 lei \(cre\?tere organica\)", "{ui.mockupLiveRev1}", content)
content = re.sub(r"- Trimestrul 2: 275\.000 lei \(sezon cald\)", "{ui.mockupLiveRev2}", content)
content = re.sub(r"- Trimestrul 3: 400\.000 lei \(B2B stabilizat\)", "{ui.mockupLiveRev3}", content)

content = content.replace("## Costuri Opera?ionale", "{ui.mockupLiveCosts}")
content = re.sub(r"## Costuri Opera\?ionale", "{ui.mockupLiveCosts}", content)
content = re.sub(r"- Salarii: 35\.000 lei / luna", "{ui.mockupLiveCosts1}", content)
content = re.sub(r"- Chirie: 15\.000 lei / luna", "{ui.mockupLiveCosts2}", content)

content = content.replace("## Stadiu Generare", "{ui.mockupLiveStatus}")
content = re.sub(r"Analiza Competi\?ie", "{ui.mockupLiveStat1}", content)
content = content.replace("Strategie Pre?uri", "{ui.mockupLiveStat2}")
content = re.sub(r"Strategie Pre\?uri", "{ui.mockupLiveStat2}", content)
content = content.replace("Calcul ROI", "{ui.mockupLiveStat3}")
content = content.replace("'Complet'", "ui.mockupLiveComplete")

# Before & After Tab
content = content.replace("Inainte", "{ui.mockupBeforeTitle}")
content = re.sub(r"&quot;Vreau sa deschid o cafenea.*?planul de afaceri.&quot;", "{ui.mockupBeforeDesc}", content, flags=re.DOTALL)

# Animated Charts Tab
content = content.replace("Distribu?ie Costuri", "{ui.costDistribution}")
content = re.sub(r"Distribu\?ie Costuri", "{ui.costDistribution}", content)
content = content.replace("'Salarii'", "ui.mockupChartSalaries")
content = re.sub(r"'Chirie & Utilita\?i'", "ui.mockupChartRent", content)
content = content.replace("'Stoc Marfa'", "ui.mockupChartStock")
content = content.replace("'Marketing'", "ui.mockupChartMarketing")
content = content.replace("Marja Profit", "{ui.mockupProfitMargin}")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated MockupPreview.tsx")
