// ==UserScript==
// @name         Scryfall卡牌汉化
// @description  为Scryfall没有中文的卡牌添加汉化，所有汉化数据均来自中文卡查sbwsz.com
// @author       lieyanqzu
// @license      GPL
// @namespace    http://github.com/lieyanqzu
// @icon         https://scryfall.com/favicon.ico
// @version      1.4
// @match        *://scryfall.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        .print-langs-item.translate-toggle {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        @media screen and (max-width: 768px) {
            .toolbox {
                position: relative;
            }
            
            .toolbox .inner-flex {
                max-height: none !important;
                overflow: visible;
            }
            
            .toolbox-toggle {
                display: none;
            }
            
            .toolbox.collapsed .inner-flex {
                max-height: none;
            }
        }
        
        @media screen and (min-width: 769px) {
            .toolbox {
                position: relative;
            }

            .toolbox .inner-flex {
                max-height: 500px;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
            }

            .toolbox.collapsed .inner-flex {
                max-height: 30px;
            }

            .toolbox h6 {
                display: flex;
                align-items: center;
                gap: 5px;
                margin: 0;
                padding: 8px 0;
            }

            .toolbox-toggle {
                cursor: pointer;
                padding: 0 5px;
                background: none;
                border: none;
                font-size: 12px;
                color: #666;
                transition: transform 0.3s ease;
            }

            .toolbox.collapsed .toolbox-toggle {
                transform: rotate(180deg);
            }
        }
    `);

    const API_BASE_URL = 'https://api.sbwsz.com/card';
    const TYPE_NAME_TRANSLATIONS_URL = 'https://sbwsz.com/static/typeName.json';
    let typeNameTranslations = null;
    const cardLanguageStates = new Map();

    GM_registerMenuCommand('默认显示中文: ' + (GM_getValue('defaultToChinese', false) ? '开' : '关'), toggleDefaultLanguage);

    function getCardInfoFromDOM(cardProfile) {
        const printsCurrentSet = cardProfile.querySelector('.prints-current-set');
        if (!printsCurrentSet) return null;

        const setMatch = printsCurrentSet.href.match(/\/sets\/(\w+)/);
        if (!setMatch) return null;
        const setCode = setMatch[1];

        const detailsText = cardProfile.querySelector('.prints-current-set-details')?.textContent || '';
        const numberMatch = detailsText.match(/#([^\s]+)/);
        if (!numberMatch) return null;
        const collectorNumber = numberMatch[1];

        return { setCode, collectorNumber };
    }

    document.addEventListener('contextmenu', function(e) {
        if (e.target.classList.contains('translate-toggle')) {
            e.preventDefault();
            e.stopPropagation();
            const parent = e.target.closest('[data-card-id]') || document;
            const cardInfo = getCardInfoFromDOM(parent);
            if (cardInfo) {
                setTimeout(() => {
                    const sbwszUrl = `https://sbwsz.com/card/${cardInfo.setCode}/${cardInfo.collectorNumber}`;
                    GM_openInTab(sbwszUrl, false);
                }, 0);
            }
            return false;
        }
    }, {capture: true, passive: false});

    function toggleDefaultLanguage() {
        const newDefault = !GM_getValue('defaultToChinese', false);
        GM_setValue('defaultToChinese', newDefault);
        location.reload();
    }

    async function getChineseCardData(setCode, collectorNumber) {
        const apiUrl = `${API_BASE_URL}/${setCode}/${collectorNumber}`;
        try {
            const response = await makeRequest('GET', apiUrl);
            const data = JSON.parse(response.responseText);
            const scryfallFaceCount = document.querySelectorAll('.card-text-title').length || 1;

            const cardName = data.data[0]?.zhs_faceName || data.data[0]?.translatedName 
            || data.data[0]?.zhs_name || data.data[0]?.officialName || data.data[0]?.name;
            if (data.rulings) {
                await saveRulings(data.rulings, cardName);
            }

            if (scryfallFaceCount === 1) {
                return processSingleFacedCard(data.data[0]);
            } else if (data.type === 'double' && data.data.length === 2) {
                return processDoubleFacedCard(data.data);
            } else if (data.type === 'normal' && data.data.length > 0) {
                return processSingleFacedCard(data.data[0]);
            }
            throw new Error('无法取中文卡牌数据');
        } catch (error) {
            console.error('获取中文卡牌数据失败:', error);
            throw error;
        }
    }

    function processCardFace(cardData) {
        const name = cardData.zhs_faceName || cardData.translatedName || cardData.zhs_name || cardData.officialName || cardData.name;
        return {
            name,
            flavorName: cardData.zhs_flavorName || cardData.faceFlavorName || cardData.flavorName,
            text: processText(cardData.translatedText || cardData.zhs_text || cardData.officialText || cardData.text, name),
            flavorText: processText(cardData.zhs_flavorText || cardData.translatedFlavorText || cardData.flavorText)
        };
    }

    const processDoubleFacedCard = data => ({
        front: processCardFace(data[0]),
        back: processCardFace(data[1])
    });

    const processSingleFacedCard = cardData => processCardFace(cardData);

    function processText(text, cardName) {
        if (!text) return text;
        text = text.replace(/\\n/g, '\n');
        return cardName ? text.replace(/CARDNAME/g, cardName) : text;
    }

    async function getTypeNameTranslations() {
        if (typeNameTranslations) return typeNameTranslations;
        try {
            const response = await makeRequest('GET', TYPE_NAME_TRANSLATIONS_URL);
            typeNameTranslations = JSON.parse(response.responseText);
            return typeNameTranslations;
        } catch (error) {
            console.error('获取类别翻译数据失败:', error);
            throw error;
        }
    }

    async function translateType(englishType) {
        const translations = await getTypeNameTranslations();
        return englishType.trim().split('—').map((part, index) => {
            const words = part.trim().split(/\s+/);
            let i = 0;
            const translatedWords = [];
            
            while (i < words.length) {
                let found = false;
                if (i < words.length - 1) {
                    const combinedWord = words[i] + words[i + 1];
                    if (translations[combinedWord]) {
                        translatedWords.push(translations[combinedWord]);
                        i += 2;
                        found = true;
                        continue;
                    }
                }
                if (!found) {
                    translatedWords.push(translations[words[i]] || words[i]);
                    i++;
                }
            }
            
            return index === 0 ? translatedWords.map(w => w.replace(/[<>]/g, '')).join('') : translatedWords.map(w => w.replace(/[<>]/g, '')).join('／');
        }).join('～');
    }    

    async function main() {
        const cardProfiles = document.querySelectorAll('.card-profile');

        const containers = cardProfiles.length > 0 ? cardProfiles : [document];

        for (const container of containers) {
            const cardInfo = getCardInfoFromDOM(container);
            if (!cardInfo) continue;

            const cardId = `${cardInfo.setCode}_${cardInfo.collectorNumber}`;
            container.dataset.cardId = cardId;

            try {
                saveOriginalContent(container);
                addToggleButton(true, container);

                const chineseData = await getChineseCardData(cardInfo.setCode, cardInfo.collectorNumber);
                const scryfallFaceCount = container.querySelectorAll('.card-text-title').length || 1;

                if (scryfallFaceCount === 1 || !chineseData.front) {
                    await saveSingleFacedCard(chineseData, container);
                } else {
                    await saveDoubleFacedCard(chineseData, container);
                }

                updateToggleButton(false, container);

                const defaultToChinese = GM_getValue('defaultToChinese', false);
                cardLanguageStates.set(cardId, false);
                if (defaultToChinese) {
                    await toggleLanguage({ 
                        preventDefault: () => {}, 
                        target: container.querySelector('.print-langs-item') 
                    }, cardId);
                }
            } catch (error) {
                console.error('处理卡牌时出错:', error);
                updateToggleButton(true, container);
            }
        }

        const toolbox = document.querySelector('.toolbox');
        if (toolbox) {
            setupToolboxCollapse(toolbox);
        }
    }

    function setupToolboxCollapse(toolbox) {
        const toolboxTitle = toolbox.querySelector('h6');
        if (!toolboxTitle) return;

        const toggleButton = document.createElement('button');
        toggleButton.className = 'toolbox-toggle';
        toggleButton.innerHTML = '▼';
        toggleButton.title = '折叠/展开工具箱';

        toolboxTitle.insertBefore(toggleButton, toolboxTitle.firstChild);

        if (document.querySelector('#rulings')) {
            toolbox.classList.add('collapsed');
        }

        toggleButton.addEventListener('click', () => {
            toolbox.classList.toggle('collapsed');
        });
    }

    function addToggleButton(loading = false, parent = document) {
        const printLangs = parent.querySelector('.print-langs');
        if (!printLangs) return;

        const cardId = parent.dataset.cardId || document.location.pathname;
        if (!parent.dataset.cardId) {
            parent.dataset.cardId = cardId;
        }

        const toggleLink = document.createElement('a');
        toggleLink.className = 'print-langs-item translate-toggle';
        toggleLink.href = 'javascript:void(0);';
        toggleLink.textContent = loading ? '加载中...' : (cardLanguageStates.get(cardId) ? '原文' : '汉化');
        toggleLink.style.cursor = loading ? 'wait' : 'pointer';

        if (!loading) {
            toggleLink.addEventListener('click', (e) => toggleLanguage(e, cardId));
        }

        printLangs.insertBefore(toggleLink, printLangs.firstChild);
    }

    function updateToggleButton(error = false, parent = document) {
        const toggleLink = parent.querySelector('.print-langs-item');
        if (toggleLink) {
            const cardId = parent.dataset.cardId || document.location.pathname;
            toggleLink.textContent = error ? '加载失败' : (cardLanguageStates.get(cardId) ? '原文' : '汉化');
            toggleLink.style.cursor = error ? 'not-allowed' : 'pointer';
            if (error) {
                toggleLink.removeEventListener('click', (e) => toggleLanguage(e, cardId));
            } else {
                toggleLink.addEventListener('click', (e) => toggleLanguage(e, cardId));
            }
        }
    }

    async function toggleLanguage(event, cardId) {
        event.preventDefault();

        const cardContainer = cardId === document.location.pathname 
        ? document 
        : document.querySelector(`[data-card-id="${cardId}"]`);

        if (!cardContainer) {
            console.error('找不到卡牌容器');
            return;
        }

        const elements = cardContainer.querySelectorAll(
            '.card-text-card-name, .card-text-flavor-name, .card-text-type-line, .card-text-oracle, .card-text-flavor, ' +
            '.card-legality-item dt, .card-legality-item dd'
        );

        const rulingsItems = document.querySelectorAll('.rulings-item');
        const allElements = [...elements, ...rulingsItems];

        const toggleLink = event.target;

        if (allElements.length === 0 || !allElements[0].dataset.chineseContent) {
            console.error('中文数据尚未加载完成');
            return;
        }

        const currentState = cardLanguageStates.get(cardId) || false;
        cardLanguageStates.set(cardId, !currentState);
        toggleLink.textContent = cardLanguageStates.get(cardId) ? '原文' : '汉化';

        allElements.forEach(el => {
            if (el.dataset.chineseContent) {
                [el.innerHTML, el.dataset.chineseContent] = [el.dataset.chineseContent, el.innerHTML];
            }
        });
    }

    function saveOriginalContent(parent = document) {
        parent.querySelectorAll(
            '.card-text-card-name, .card-text-flavor-name, .card-text-type-line, .card-text-oracle, .card-text-flavor'
        ).forEach(el => {
            el.dataset.originalContent = el.innerHTML;
        });
    }

    async function saveSingleFacedCard(chineseData, parent = document) {
        await saveCardFace(parent, parent, chineseData, 0);
        console.log('中文数据已保存');
    }

    async function saveDoubleFacedCard(chineseData, parent = document) {
        const cardTextDiv = parent.querySelector('.card-text');
        if (!cardTextDiv) {
            console.error('无法找到卡牌文本元素');
            return;
        }

        const cardFaces = cardTextDiv.querySelectorAll('.card-text-title');
        if (cardFaces.length !== 2) {
            console.error('无法找到双面卡牌的元素');
            return;
        }

        await Promise.all([
            saveCardFace(cardTextDiv, cardFaces[0], chineseData.front, 0),
            saveCardFace(cardTextDiv, cardFaces[1], chineseData.back, 1)
        ]);
    }

    async function saveCardFace(cardTextDiv, cardFace, faceData, faceIndex) {
        if (!faceData) return;

        await Promise.all([
            saveElementText('.card-text-card-name', faceData.name, cardFace),
            faceData.flavorName ? saveElementText('.card-text-flavor-name', faceData.flavorName, cardFace) : Promise.resolve(),
            saveType(cardTextDiv.querySelectorAll('.card-text-type-line')[faceIndex], faceData.name),
            saveCardText('.card-text-oracle', faceData.text, cardTextDiv, faceIndex),
            faceData.flavorText ? saveCardText('.card-text-flavor', faceData.flavorText, cardTextDiv, faceIndex) : Promise.resolve(),
            saveLegality(cardTextDiv)
        ]);
    }

    async function saveElementText(selector, text, parent = document) {
        const element = parent.querySelector(selector);
        if (element) {
            element.dataset.chineseContent = text;
        }
    }

    async function saveType(typeLineElement, cardName) {
        if (!typeLineElement) return;
        const colorIndicator = typeLineElement.querySelector('.color-indicator');
        const typeText = typeLineElement.textContent.replace(colorIndicator ? colorIndicator.textContent.trim() : '', '').trim();

        try {
            const translatedType = await translateType(typeText);
            typeLineElement.dataset.chineseContent = colorIndicator
                ? `${colorIndicator.outerHTML} ${translatedType}`
            : translatedType;
        } catch (error) {
            console.error('翻译类型时出错:', error);
        }
    }

    async function saveCardText(selector, text, parent = document, index = 0) {
        const elements = parent.querySelectorAll(selector);
        if (elements[index]) {
            const preservedHtml = await preserveManaSymbols(elements[index].innerHTML, text);
            elements[index].dataset.chineseContent = `<p>${preservedHtml.replace(/\n/g, '</p><p>')}</p>`;
        } else if (index === 1) {
            const frontElement = elements[0];
            if (frontElement) {
                const preservedHtml = await preserveManaSymbols(frontElement.innerHTML, text);
                frontElement.dataset.chineseContent = `<p>${preservedHtml.replace(/\n/g, '</p><p>')}</p>`;
            }
        }
    }

    async function preserveManaSymbols(originalHtml, chineseText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHtml;

        const symbols = tempDiv.querySelectorAll('abbr.card-symbol');
        const symbolMap = new Map();

        symbols.forEach(symbol => {
            const symbolText = symbol.title.match(/\{(.+?)\}/)?.[0] || 
                  symbol.textContent.match(/\{(.+?)\}/)?.[0] || 
                  `{${symbol.textContent}}`;
            symbolMap.set(symbolText, (symbolMap.get(symbolText) || []).concat(symbol.outerHTML));
        });

        return Array.from(symbolMap).reduce((result, [symbolText, htmls]) => {
            let index = 0;
            return result.replace(new RegExp(escapeRegExp(symbolText), 'g'), () => {
                const html = htmls[index];
                index = (index + 1) % htmls.length;
                return html;
            });
        }, chineseText);
    }

    const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    function makeRequest(method, url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method,
                url,
                onload: resolve,
                onerror: reject
            });
        });
    }

    const FORMAT_TRANSLATIONS = {
        'Standard': '标准',
        'Alchemy': '炼金',
        'Pioneer': '先驱',
        'Explorer': '探险',
        'Modern': '摩登',
        'Historic': '史迹',
        'Legacy': '薪传',
        'Brawl': '争锋',
        'Vintage': '特选',
        'Timeless': '永恒',
        'Commander': '指挥官',
        'Pauper': '纯铁',
        'Oathbreaker': '破誓人',
        'Penny': '便士'
    };

    const LEGALITY_TRANSLATIONS = {
        'Legal': '合法',
        'Not Legal': '不合法',
        'Banned': '禁用',
        'Restrict.': '限制'
    };

    async function saveLegality(parent = document) {
        const legalityItems = parent.querySelectorAll('.card-legality-item');
        legalityItems.forEach(item => {
            const format = item.querySelector('dt');
            const legality = item.querySelector('dd');

            if (format && legality) {
                const formatText = format.textContent.trim();
                format.dataset.chineseContent = FORMAT_TRANSLATIONS[formatText] || formatText;

                const legalityText = legality.textContent.trim();
                legality.dataset.chineseContent = LEGALITY_TRANSLATIONS[legalityText] || legalityText;
            }
        });
    }

    async function saveRulings(rulings, cardName) {
        const rulingsContainer = document.querySelector('#rulings');
        if (!rulingsContainer) {
            return;
        }

        const rulingsItems = rulingsContainer.querySelectorAll('.rulings-item');

        for (const item of rulingsItems) {
            const dateSpan = item.querySelector('.rulings-item-date');
            const date = dateSpan ? dateSpan.textContent.replace(/[()]/g, '') : '';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = item.innerHTML;
            dateSpan && tempDiv.removeChild(tempDiv.querySelector('.rulings-item-date'));
            const englishText = tempDiv.textContent.trim();

            const abbrTags = [];
            item.querySelectorAll('abbr.card-symbol').forEach(abbr => {
                abbrTags.push(abbr.outerHTML);
            });

            const matchingRuling = rulings.find(r => {
                const tempApiDiv = document.createElement('div');
                tempApiDiv.textContent = r.text;
                const normalizedApiText = tempApiDiv.textContent.trim().replace(/[\u0021-\u002F\u003A-\u003F\u2000-\u206F\u3000-\u303F\uFF00-\uFFEF]/g, '');
                const normalizedEnglishText = englishText.replace(/[\u0021-\u002F\u003A-\u003F\u2000-\u206F\u3000-\u303F\uFF00-\uFFEF]/g, '');
                return normalizedApiText === normalizedEnglishText;
            });

            if (matchingRuling && matchingRuling.zhs_text) {                
                item.dataset.originalContent = item.innerHTML;
                let translatedText = processText(matchingRuling.zhs_text, cardName);
                const matches = translatedText.match(/\{[^}]+\}/g) || [];

                matches.forEach((match, index) => {
                    if (abbrTags[index]) {
                        translatedText = translatedText.replace(match, abbrTags[index]);
                    }
                });
                const newHtml = dateSpan 
                ? translatedText + dateSpan.outerHTML
                : translatedText;
                item.dataset.chineseContent = newHtml;
            }
        }
    }

    main();
})();