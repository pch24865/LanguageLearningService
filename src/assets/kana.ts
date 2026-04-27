import { type Word } from '../store/useStore';

export const kanaGroups = {
  'Hiragana': [
    { original: 'あ', furigana: 'a', korean: '아' }, { original: 'い', furigana: 'i', korean: '이' }, { original: 'う', furigana: 'u', korean: '우' }, { original: 'え', furigana: 'e', korean: '에' }, { original: 'お', furigana: 'o', korean: '오' },
    { original: 'か', furigana: 'ka', korean: '카' }, { original: 'き', furigana: 'ki', korean: '키' }, { original: 'く', furigana: 'ku', korean: '쿠' }, { original: 'け', furigana: 'ke', korean: '케' }, { original: 'こ', furigana: 'ko', korean: '코' },
    { original: 'さ', furigana: 'sa', korean: '사' }, { original: 'し', furigana: 'shi', korean: '시' }, { original: 'す', furigana: 'su', korean: '스' }, { original: 'せ', furigana: 'se', korean: '세' }, { original: 'そ', furigana: 'so', korean: '소' },
    { original: 'た', furigana: 'ta', korean: '타' }, { original: 'ち', furigana: 'chi', korean: '치' }, { original: 'つ', furigana: 'tsu', korean: '츠' }, { original: 'て', furigana: 'te', korean: '테' }, { original: 'と', furigana: 'to', korean: '토' },
    { original: 'な', furigana: 'na', korean: '나' }, { original: 'に', furigana: 'ni', korean: '니' }, { original: 'ぬ', furigana: 'nu', korean: '누' }, { original: 'ね', furigana: 'ne', korean: '네' }, { original: 'の', furigana: 'no', korean: '노' },
    { original: 'は', furigana: 'ha', korean: '하' }, { original: 'ひ', furigana: 'hi', korean: '히' }, { original: 'ふ', furigana: 'fu', korean: '후' }, { original: 'へ', furigana: 'he', korean: '헤' }, { original: 'ほ', furigana: 'ho', korean: '호' },
    { original: 'ま', furigana: 'ma', korean: '마' }, { original: 'み', furigana: 'mi', korean: '미' }, { original: 'む', furigana: 'mu', korean: '무' }, { original: 'め', furigana: 'me', korean: '메' }, { original: 'も', furigana: 'mo', korean: '모' },
    { original: 'や', furigana: 'ya', korean: '야' }, { original: 'ゆ', furigana: 'yu', korean: '유' }, { original: 'よ', furigana: 'yo', korean: '요' },
    { original: 'ら', furigana: 'ra', korean: '라' }, { original: 'り', furigana: 'ri', korean: '리' }, { original: 'る', furigana: 'ru', korean: '루' }, { original: 'れ', furigana: 're', korean: '레' }, { original: 'ろ', furigana: 'ro', korean: '로' },
    { original: 'わ', furigana: 'wa', korean: '와' }, { original: 'を', furigana: 'wo', korean: '오(를)' }, { original: 'ん', furigana: 'n', korean: '응(n)' },
    { original: 'が', furigana: 'ga', korean: '가' }, { original: 'ぎ', furigana: 'gi', korean: '기' }, { original: 'ぐ', furigana: 'gu', korean: '구' }, { original: 'げ', furigana: 'ge', korean: '게' }, { original: 'ご', furigana: 'go', korean: '고' },
    { original: 'ざ', furigana: 'za', korean: '자' }, { original: 'じ', furigana: 'ji', korean: '지' }, { original: 'ず', furigana: 'zu', korean: '즈' }, { original: 'ぜ', furigana: 'ze', korean: '제' }, { original: 'ぞ', furigana: 'zo', korean: '조' },
    { original: 'だ', furigana: 'da', korean: '다' }, { original: 'ぢ', furigana: 'ji', korean: '지' }, { original: 'づ', furigana: 'zu', korean: '즈' }, { original: 'で', furigana: 'de', korean: '데' }, { original: 'ど', furigana: 'do', korean: '도' },
    { original: 'ば', furigana: 'ba', korean: '바' }, { original: 'び', furigana: 'bi', korean: '비' }, { original: 'ぶ', furigana: 'bu', korean: '부' }, { original: 'べ', furigana: 'be', korean: '베' }, { original: 'ぼ', furigana: 'bo', korean: '보' },
    { original: 'ぱ', furigana: 'pa', korean: '파' }, { original: 'ぴ', furigana: 'pi', korean: '피' }, { original: 'ぷ', furigana: 'pu', korean: '푸' }, { original: 'ぺ', furigana: 'pe', korean: '페' }, { original: 'ぽ', furigana: 'po', korean: '포' },
  ] as Word[],
  'Katakana': [
    { original: 'ア', furigana: 'a', korean: '아' }, { original: 'イ', furigana: 'i', korean: '이' }, { original: 'ウ', furigana: 'u', korean: '우' }, { original: 'エ', furigana: 'e', korean: '에' }, { original: 'オ', furigana: 'o', korean: '오' },
    { original: 'カ', furigana: 'ka', korean: '카' }, { original: 'キ', furigana: 'ki', korean: '키' }, { original: 'ク', furigana: 'ku', korean: '쿠' }, { original: 'ケ', furigana: 'ke', korean: '케' }, { original: 'コ', furigana: 'ko', korean: '코' },
    { original: 'サ', furigana: 'sa', korean: '사' }, { original: 'シ', furigana: 'shi', korean: '시' }, { original: 'ス', furigana: 'su', korean: '스' }, { original: 'セ', furigana: 'se', korean: '세' }, { original: 'ソ', furigana: 'so', korean: '소' },
    { original: 'タ', furigana: 'ta', korean: '타' }, { original: 'チ', furigana: 'chi', korean: '치' }, { original: 'ツ', furigana: 'tsu', korean: '츠' }, { original: 'テ', furigana: 'te', korean: '테' }, { original: 'ト', furigana: 'to', korean: '토' },
    { original: 'ナ', furigana: 'na', korean: '나' }, { original: 'ニ', furigana: 'ni', korean: '니' }, { original: 'ヌ', furigana: 'nu', korean: '누' }, { original: 'ネ', furigana: 'ne', korean: '네' }, { original: 'ノ', furigana: 'no', korean: '노' },
    { original: 'ハ', furigana: 'ha', korean: '하' }, { original: 'ヒ', furigana: 'hi', korean: '히' }, { original: 'フ', furigana: 'fu', korean: '후' }, { original: 'ヘ', furigana: 'he', korean: '헤' }, { original: 'ホ', furigana: 'ho', korean: '호' },
    { original: 'マ', furigana: 'ma', korean: '마' }, { original: 'ミ', furigana: 'mi', korean: '미' }, { original: 'ム', furigana: 'mu', korean: '무' }, { original: 'メ', furigana: 'me', korean: '메' }, { original: 'モ', furigana: 'mo', korean: '모' },
    { original: 'ヤ', furigana: 'ya', korean: '야' }, { original: 'ユ', furigana: 'yu', korean: '유' }, { original: 'ヨ', furigana: 'yo', korean: '요' },
    { original: 'ラ', furigana: 'ra', korean: '라' }, { original: 'リ', furigana: 'ri', korean: '리' }, { original: 'ル', furigana: 'ru', korean: '루' }, { original: 'レ', furigana: 're', korean: '레' }, { original: 'ロ', furigana: 'ro', korean: '로' },
    { original: 'ワ', furigana: 'wa', korean: '와' }, { original: 'ヲ', furigana: 'wo', korean: '오(를)' }, { original: 'ン', furigana: 'n', korean: '응(n)' },
    { original: 'ガ', furigana: 'ga', korean: '가' }, { original: 'ギ', furigana: 'gi', korean: '기' }, { original: 'グ', furigana: 'gu', korean: '구' }, { original: 'ゲ', furigana: 'ge', korean: '게' }, { original: 'ゴ', furigana: 'go', korean: '고' },
    { original: 'ザ', furigana: 'za', korean: '자' }, { original: 'ジ', furigana: 'ji', korean: '지' }, { original: 'ズ', furigana: 'zu', korean: '즈' }, { original: 'ゼ', furigana: 'ze', korean: '제' }, { original: 'ゾ', furigana: 'zo', korean: '조' },
    { original: 'ダ', furigana: 'da', korean: '다' }, { original: 'ヂ', furigana: 'ji', korean: '지' }, { original: 'ヅ', furigana: 'zu', korean: '즈' }, { original: 'デ', furigana: 'de', korean: '데' }, { original: 'ド', furigana: 'do', korean: '도' },
    { original: 'バ', furigana: 'ba', korean: '바' }, { original: 'ビ', furigana: 'bi', korean: '비' }, { original: 'ブ', furigana: 'bu', korean: '부' }, { original: 'ベ', furigana: 'be', korean: '베' }, { original: 'ボ', furigana: 'bo', korean: '보' },
    { original: 'パ', furigana: 'pa', korean: '파' }, { original: 'ピ', furigana: 'pi', korean: '피' }, { original: 'プ', furigana: 'pu', korean: '푸' }, { original: 'ペ', furigana: 'pe', korean: '페' }, { original: 'ポ', furigana: 'po', korean: '포' },
  ] as Word[]
};

export const KANA_LEVELS = Object.keys(kanaGroups);
