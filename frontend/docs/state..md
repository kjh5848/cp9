### 상태값( state )을 “정리”한다는 것은?

1. **의미별로 묶고, 불필요한 중복을 없앤다.**
    - “저장 값”과 “표시용 값”을 둘 다 `useState`로 들고 있으면 하나만 수정할 때 다른 쪽을 놓치기 쉽습니다.
2. **변경 흐름을 명확히 한다.**
    - “폼 입력 ➜ 내부 가공 ➜ 상위 로직 호출” 같은 단계가 코드만 봐도 드러나면, 디버깅도 간단합니다.
3. **컴포넌트-관심사와 전역-관심사를 분리한다.**
    - 동일한 카테고리·프리셋을 여러 화면에서 공유한다면 전역 store(예: Zustand)로,
    - 폼 안에서만 쓰는 값은 로컬 state/fook(useForm 등)로.

아래는 **`ProductCategorySearchForm`** 예시를 그대로 개선해보면서, 상태 정리 원칙을 단계별로 보여드립니다.

---

## 1. “표시용” state → 파생값으로 전환

```tsx
// BEFORE ─ 두 개의 state 가 서로를 복사
const [priceMin, setPriceMin] = useState(0);
const [priceMinDisplay, setPriceMinDisplay] = useState("0");

// AFTER ─ 값을 하나만 저장하고, 보여줄 때 포맷
const [priceRange, setPriceRange] = useState<[number, number]>([0, 5_000_000]);

// 파생값
const priceMinDisplay = useMemo(
  () => formatNumber(priceRange[0].toString()),
  [priceRange]
);

```

*이득* : 입력·리셋·프리셋 클릭 때 **단 한 곳**만 바꾸면 됨.

---

## 2. 관련 필드를 “그룹화”

```tsx
// BEFORE ─ 상태 분산
const [categoryId, setCategoryId] = useState("");
const [imageSize, setImageSize] = useState(512);
const [bestLimit, setBestLimit] = useState(20);

// AFTER ─ 객체/레코드로 묶기
type SearchOption = {
  categoryId: string;
  imageSize: number;
  bestLimit: number;
  price: [number, number];
};
const [options, setOptions] = useState<SearchOption>({
  categoryId: "",
  imageSize: 512,
  bestLimit: 20,
  price: [0, 5_000_000],
});

// 한 필드만 바꿀 때
const updateOption = <K extends keyof SearchOption>(k: K, v: SearchOption[K]) =>
  setOptions((prev) => ({ ...prev, [k]: v }));

```

*이득* : `handleCategorySearch()` 같이 옵션 전체를 쓰는 함수에 **한 객체**만 넘기면 된다. prop-drilling도 줄어듦.

---

## 3. `useForm` / `react-hook-form`으로 대체

폼-위주의 화면이라면 **로컬 UI state**를 직접 관리하기보다 검증·reset 기능이 내장된 **폼 hook**을 쓰면 더 깔끔합니다.

```tsx
import { useForm } from "react-hook-form";

type FormValues = {
  categoryId: string;
  imageSize: number;
  bestLimit: number;
  priceMin: string;  // 문자열 그대로 받아서
  priceMax: string;
};

const { register, handleSubmit, watch, reset } = useForm<FormValues>({
  defaultValues: {
    categoryId: "",
    imageSize: 512,
    bestLimit: 20,
    priceMin: "0",
    priceMax: "5,000,000",
  },
});

const onSubmit = (data: FormValues) => {
  const { priceMin, priceMax, ...rest } = data;
  handleCategorySearch({
    ...rest,
    price: [parseNumber(priceMin), parseNumber(priceMax)],
  });
};

```

*이득* :

- **상태 선언이 사라짐** → 폼 필드가 늘어나도 코드 변화 최소.
- 검증이나 초기화(reset)도 원-라이너.
- “표시용 포맷” 여전히 필요하다면 `Controller` 컴포넌트를 써서 포맷/파싱만 캡슐화.

---

## 4. 단순 상수는 컴포넌트 밖에서

```tsx
// 현재 위치 OK – 하지만 재사용한다면 별도 constants.ts
export const IMAGE_SIZE_OPTIONS = [256, 512, 768, 1024] as const;

```

---

## 5. 전역 상태(Zustand)와 로컬 상태의 경계

- **전역**:
    - `pricePresets`, `addPricePreset`, `removePricePreset` 처럼 여러 화면에서 쓰이는 사용자 정의 값.
    - 로그인 유저·다크모드 같은 글로벌 콘텍스트.
- **로컬**:
    - 모달 open/close,
    - 현재 입력값(watch 값),
    - 검색 결과 1회성 캐시.

> 전역 store에 불필요하게 자주 변하는 값(keypress마다 바뀌는 input)까지 넣으면 다른 컴포넌트가 -- 필요도 없는데 -- re-render되어 성능이 나빠집니다.
> 

---

## 6. 커스텀 hook으로 역할 분리

```tsx
function usePriceRange(initial: [number, number]) {
  const [range, setRange] = useState(initial);
  const reset = () => setRange(initial);

  const setMin = (v: number) => setRange(([_, max]) => [v, max]);
  const setMax = (v: number) => setRange(([min]) => [min, v]);

  return { range, setMin, setMax, reset };
}

```

*이득* : 가격 입력 필드가 다른 화면에도 필요할 때 “로직 복붙”을 막을 수 있다.

---

## 7. 상태 정리 체크리스트

| 체크 | 설명 |
| --- | --- |
| ✅ **단일 근원(source of truth)** | 같은 데이터를 두 번 `useState` 하지 않았는가? |
| ✅ **의미별 grouping** | 밀접한 값은 객체 state·커스텀 hook으로 묶었는가? |
| ✅ **계산값은 파생** | 포맷 문자열·필터링 결과는 `useMemo` / `selector`로? |
| ✅ **전역과 로컬 분리** | 여러 페이지에서 쓰이는 값만 store/context로? |
| ✅ **폼은 전용 hook 사용** | 직접 `useState` 대신 `react-hook-form` / `formik`? |

---

### 결론

- “상태값 정리”는 결국 **❶ 중복 제거, ❷ 관심사 구분, ❸ 흐름 단순화**입니다.
- 위 원칙들을 적용하면 코드는 짧아지고, 버그 포인트(동기화 누락·불필요 리렌더)도 줄어듭니다.
- 이미 사용 중인 **Zustand**는 “전역 단위 캐시” 역할에 집중하고, **폼·모달**류는 **로컬 hook/폼 라이브러리**로 처리하는 구도가 가장 안전합니다.

필요하다면 실제 코드를 refactor한 예시나 커스텀 hook 템플릿을 더 보여드릴 테니 말씀 주세요!