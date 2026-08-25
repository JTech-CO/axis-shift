# M03 콘텐츠 큐레이션 체크리스트 — v1

> 이 파일의 보드·수치·해답 정보는 자동 생성된 E2/E3 검토 보조 자료다. 사람 검토 결과는 아래 reviewer/time/decision 및 판정 필드에 기록한다.

- Catalog version: `content-v1`
- Generator version: `v1`
- Candidate seed: `axis-shift-curation-v1`
- Catalog SHA-256: `c625d54327e5a6c3c6305a373d5199abd01c6fb69415161f9d4aee27c1738484`
- Approval fingerprint SHA-256: `5a60604a91b51c88ab294701b7a1eb286b00700101643807c80d5d10d59b7e6a`
- Automated candidates: 54
- Human reviewer: **프로젝트 오너**
- Reviewed at: **2026-08-26T00:20:42+09:00**
- Overall decision: **APPROVED**

## 학습 순서 승인

| 구간 | 도입 개념 | 선행 개념 | 사람 판정 | 메모 |
|---|---|---|---|---|
| Tutorial 1→6 | 행 → 열 → 교차점 → PULSE → 복수 축 → 중첩 취소 | 없음 | PASS | 전체 승인 / 교체·재분류 없음 |
| Pulse 01→12 | 직접적인 축 묶음과 rank 1→3 | Tutorial | PASS | 전체 승인 / 교체·재분류 없음 |
| Echo 01→12 | 겹침과 짝수 번 취소 | Tutorial Echo, Pulse | PASS | 전체 승인 / 교체·재분류 없음 |
| Rank 01→12 | sweep보다 압축된 최소 PULSE | Pulse, Echo | PASS | 전체 승인 / 교체·재분류 없음 |
| Noise 01→12 | 비어 있지 않은 initial에서 차이 읽기 | Pulse, Echo, Rank | PASS | 전체 승인 / 교체·재분류 없음 |

## 개별 후보 atlas

### tutorial-01-row

- titleKey: `level.tutorial.01.title`
- chapter/order: `tutorial/1`
- candidate attempt: 0
- size/rank/difficulty: 3×3 / 1 / intro
- tags: sparse, symmetric, tutorial
- density/target/initial: 0.2222 / 0.2222 / 0.0000
- nonzero rows/cols, sweep/gap: 1/2, 1/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 9 / 3
- canonical: [{"colMask":5,"rowMask":2}]

```text
INITIAL
· · ·
· · ·
· · ·

TARGET
· · ·
◆ · ◆
· · ·

DIFFERENCE
· · ·
◆ · ◆
· · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### tutorial-02-column

- titleKey: `level.tutorial.02.title`
- chapter/order: `tutorial/2`
- candidate attempt: 0
- size/rank/difficulty: 3×3 / 1 / intro
- tags: sparse, symmetric, tutorial
- density/target/initial: 0.2222 / 0.2222 / 0.0000
- nonzero rows/cols, sweep/gap: 2/1, 1/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 7 / 3
- canonical: [{"colMask":2,"rowMask":6}]

```text
INITIAL
· · ·
· · ·
· · ·

TARGET
· · ·
· ◆ ·
· ◆ ·

DIFFERENCE
· · ·
· ◆ ·
· ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### tutorial-03-intersection

- titleKey: `level.tutorial.03.title`
- chapter/order: `tutorial/3`
- candidate attempt: 0
- size/rank/difficulty: 3×3 / 1 / intro
- tags: sparse, symmetric, tutorial
- density/target/initial: 0.1111 / 0.1111 / 0.0000
- nonzero rows/cols, sweep/gap: 1/1, 1/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 3 / 2
- canonical: [{"colMask":2,"rowMask":1}]

```text
INITIAL
· · ·
· · ·
· · ·

TARGET
· ◆ ·
· · ·
· · ·

DIFFERENCE
· ◆ ·
· · ·
· · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### tutorial-04-pulse

- titleKey: `level.tutorial.04.title`
- chapter/order: `tutorial/4`
- candidate attempt: 0
- size/rank/difficulty: 3×3 / 1 / intro
- tags: sparse, symmetric, tutorial
- density/target/initial: 0.2222 / 0.2222 / 0.0000
- nonzero rows/cols, sweep/gap: 1/2, 1/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 7 / 3
- canonical: [{"colMask":6,"rowMask":2}]

```text
INITIAL
· · ·
· · ·
· · ·

TARGET
· · ·
· ◆ ◆
· · ·

DIFFERENCE
· · ·
· ◆ ◆
· · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### tutorial-05-multi-axis

- titleKey: `level.tutorial.05.title`
- chapter/order: `tutorial/5`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 1 / intro
- tags: sparse, asymmetric, tutorial
- density/target/initial: 0.2500 / 0.2500 / 0.0000
- nonzero rows/cols, sweep/gap: 2/2, 2/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.5000 / 16 / 4
- canonical: [{"colMask":5,"rowMask":3}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
◆ · ◆ ·
◆ · ◆ ·
· · · ·
· · · ·

DIFFERENCE
◆ · ◆ ·
◆ · ◆ ·
· · · ·
· · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### tutorial-06-echo

- titleKey: `level.tutorial.06.title`
- chapter/order: `tutorial/6`
- candidate attempt: 3
- size/rank/difficulty: 4×4 / 2 / intro
- tags: asymmetric, overlap, tutorial
- density/target/initial: 0.5000 / 0.5000 / 0.0000
- nonzero rows/cols, sweep/gap: 3/4, 3/1
- overlap/symmetry/complexity/gesture: 0.2000 / 0.5000 / 40 / 10
- canonical: [{"colMask":13,"rowMask":8},{"colMask":14,"rowMask":11}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· ◆ ◆ ◆
· ◆ ◆ ◆
· · · ·
◆ ◆ · ·

DIFFERENCE
· ◆ ◆ ◆
· ◆ ◆ ◆
· · · ·
◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-01

- titleKey: `level.lab.pulse.01.title`
- chapter/order: `pulse/1`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 1 / easy
- tags: sparse, symmetric
- density/target/initial: 0.2500 / 0.2500 / 0.0000
- nonzero rows/cols, sweep/gap: 4/1, 1/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 13 / 5
- canonical: [{"colMask":2,"rowMask":15}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· ◆ · ·
· ◆ · ·
· ◆ · ·
· ◆ · ·

DIFFERENCE
· ◆ · ·
· ◆ · ·
· ◆ · ·
· ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-02

- titleKey: `level.lab.pulse.02.title`
- chapter/order: `pulse/2`
- candidate attempt: 145
- size/rank/difficulty: 4×4 / 1 / easy
- tags: symmetric
- density/target/initial: 0.5000 / 0.5000 / 0.0000
- nonzero rows/cols, sweep/gap: 2/4, 2/1
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 15 / 6
- canonical: [{"colMask":15,"rowMask":6}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· · · ·
◆ ◆ ◆ ◆
◆ ◆ ◆ ◆
· · · ·

DIFFERENCE
· · · ·
◆ ◆ ◆ ◆
◆ ◆ ◆ ◆
· · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-03

- titleKey: `level.lab.pulse.03.title`
- chapter/order: `pulse/3`
- candidate attempt: 2
- size/rank/difficulty: 4×4 / 1 / easy
- tags: asymmetric
- density/target/initial: 0.3750 / 0.3750 / 0.0000
- nonzero rows/cols, sweep/gap: 3/2, 2/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.7500 / 16 / 5
- canonical: [{"colMask":12,"rowMask":11}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· · ◆ ◆
· · ◆ ◆
· · · ·
· · ◆ ◆

DIFFERENCE
· · ◆ ◆
· · ◆ ◆
· · · ·
· · ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-04

- titleKey: `level.lab.pulse.04.title`
- chapter/order: `pulse/4`
- candidate attempt: 2
- size/rank/difficulty: 4×4 / 1 / easy
- tags: dense, asymmetric
- density/target/initial: 0.5625 / 0.5625 / 0.0000
- nonzero rows/cols, sweep/gap: 3/3, 3/2
- overlap/symmetry/complexity/gesture: 0.0000 / 0.6250 / 18 / 6
- canonical: [{"colMask":11,"rowMask":7}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
◆ ◆ · ◆
◆ ◆ · ◆
◆ ◆ · ◆
· · · ·

DIFFERENCE
◆ ◆ · ◆
◆ ◆ · ◆
◆ ◆ · ◆
· · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-05

- titleKey: `level.lab.pulse.05.title`
- chapter/order: `pulse/5`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 2 / easy
- tags: sparse, asymmetric
- density/target/initial: 0.3125 / 0.3125 / 0.0000
- nonzero rows/cols, sweep/gap: 3/3, 3/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.6250 / 34 / 6
- canonical: [{"colMask":5,"rowMask":12},{"colMask":2,"rowMask":1}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· ◆ · ·
· · · ·
◆ · ◆ ·
◆ · ◆ ·

DIFFERENCE
· ◆ · ·
· · · ·
◆ · ◆ ·
◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-06

- titleKey: `level.lab.pulse.06.title`
- chapter/order: `pulse/6`
- candidate attempt: 11
- size/rank/difficulty: 4×4 / 2 / easy
- tags: symmetric
- density/target/initial: 0.5000 / 0.5000 / 0.0000
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 34 / 8
- canonical: [{"colMask":3,"rowMask":10},{"colMask":12,"rowMask":5}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· · ◆ ◆
◆ ◆ · ·
· · ◆ ◆
◆ ◆ · ·

DIFFERENCE
· · ◆ ◆
◆ ◆ · ·
· · ◆ ◆
◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-07

- titleKey: `level.lab.pulse.07.title`
- chapter/order: `pulse/7`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 2 / normal
- tags: asymmetric
- density/target/initial: 0.5000 / 0.5000 / 0.0000
- nonzero rows/cols, sweep/gap: 4/3, 3/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.5000 / 37 / 9
- canonical: [{"colMask":5,"rowMask":10},{"colMask":2,"rowMask":15}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· ◆ · ·
◆ ◆ ◆ ·
· ◆ · ·
◆ ◆ ◆ ·

DIFFERENCE
· ◆ · ·
◆ ◆ ◆ ·
· ◆ · ·
◆ ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-08

- titleKey: `level.lab.pulse.08.title`
- chapter/order: `pulse/8`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 2 / normal
- tags: dense, symmetric
- density/target/initial: 0.6250 / 0.6250 / 0.0000
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 35 / 9
- canonical: [{"colMask":9,"rowMask":15},{"colMask":6,"rowMask":8}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
◆ · · ◆
◆ · · ◆
◆ · · ◆
◆ ◆ ◆ ◆

DIFFERENCE
◆ · · ◆
◆ · · ◆
◆ · · ◆
◆ ◆ ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-09

- titleKey: `level.lab.pulse.09.title`
- chapter/order: `pulse/9`
- candidate attempt: 1
- size/rank/difficulty: 5×5 / 2 / normal
- tags: sparse, symmetric
- density/target/initial: 0.2800 / 0.2800 / 0.0000
- nonzero rows/cols, sweep/gap: 5/2, 2/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 37 / 9
- canonical: [{"colMask":8,"rowMask":31},{"colMask":16,"rowMask":10}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· · · ◆ ·
· · · ◆ ◆
· · · ◆ ·
· · · ◆ ◆
· · · ◆ ·

DIFFERENCE
· · · ◆ ·
· · · ◆ ◆
· · · ◆ ·
· · · ◆ ◆
· · · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-10

- titleKey: `level.lab.pulse.10.title`
- chapter/order: `pulse/10`
- candidate attempt: 24
- size/rank/difficulty: 5×5 / 2 / normal
- tags: sparse, symmetric
- density/target/initial: 0.2400 / 0.2400 / 0.0000
- nonzero rows/cols, sweep/gap: 4/2, 2/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 37 / 8
- canonical: [{"colMask":2,"rowMask":25},{"colMask":8,"rowMask":19}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· ◆ · ◆ ·
· · · ◆ ·
· · · · ·
· ◆ · · ·
· ◆ · ◆ ·

DIFFERENCE
· ◆ · ◆ ·
· · · ◆ ·
· · · · ·
· ◆ · · ·
· ◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-11

- titleKey: `level.lab.pulse.11.title`
- chapter/order: `pulse/11`
- candidate attempt: 1
- size/rank/difficulty: 5×5 / 3 / normal
- tags: asymmetric
- density/target/initial: 0.4800 / 0.4800 / 0.0000
- nonzero rows/cols, sweep/gap: 4/4, 4/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.8400 / 58 / 12
- canonical: [{"colMask":5,"rowMask":27},{"colMask":2,"rowMask":2},{"colMask":8,"rowMask":19}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ · ◆ ◆ ·
◆ ◆ ◆ ◆ ·
· · · · ·
◆ · ◆ · ·
◆ · ◆ ◆ ·

DIFFERENCE
◆ · ◆ ◆ ·
◆ ◆ ◆ ◆ ·
· · · · ·
◆ · ◆ · ·
◆ · ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-01-pulse-12

- titleKey: `level.lab.pulse.12.title`
- chapter/order: `pulse/12`
- candidate attempt: 12
- size/rank/difficulty: 5×5 / 3 / normal
- tags: dense, asymmetric
- density/target/initial: 0.6000 / 0.6000 / 0.0000
- nonzero rows/cols, sweep/gap: 5/4, 4/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.8400 / 58 / 14
- canonical: [{"colMask":1,"rowMask":29},{"colMask":6,"rowMask":31},{"colMask":8,"rowMask":1}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ ◆ ◆ ◆ ·
· ◆ ◆ · ·
◆ ◆ ◆ · ·
◆ ◆ ◆ · ·
◆ ◆ ◆ · ·

DIFFERENCE
◆ ◆ ◆ ◆ ·
· ◆ ◆ · ·
◆ ◆ ◆ · ·
◆ ◆ ◆ · ·
◆ ◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-01

- titleKey: `level.lab.echo.01.title`
- chapter/order: `echo/1`
- candidate attempt: 37
- size/rank/difficulty: 4×4 / 2 / easy
- tags: sparse, asymmetric, overlap
- density/target/initial: 0.2500 / 0.2500 / 0.0000
- nonzero rows/cols, sweep/gap: 2/3, 2/0
- overlap/symmetry/complexity/gesture: 0.2000 / 0.7500 / 36 / 7
- canonical: [{"colMask":5,"rowMask":6},{"colMask":6,"rowMask":4}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· · · ·
◆ · ◆ ·
◆ ◆ · ·
· · · ·

DIFFERENCE
· · · ·
◆ · ◆ ·
◆ ◆ · ·
· · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-02

- titleKey: `level.lab.echo.02.title`
- chapter/order: `echo/2`
- candidate attempt: 8
- size/rank/difficulty: 4×4 / 2 / easy
- tags: dense, symmetric, overlap
- density/target/initial: 0.6250 / 0.6250 / 0.0000
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.0909 / 1.0000 / 36 / 10
- canonical: [{"colMask":9,"rowMask":13},{"colMask":14,"rowMask":6}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
◆ · · ◆
· ◆ ◆ ◆
◆ ◆ ◆ ·
◆ · · ◆

DIFFERENCE
◆ · · ◆
· ◆ ◆ ◆
◆ ◆ ◆ ·
◆ · · ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-03

- titleKey: `level.lab.echo.03.title`
- chapter/order: `echo/3`
- candidate attempt: 1
- size/rank/difficulty: 4×4 / 2 / normal
- tags: asymmetric, overlap
- density/target/initial: 0.5000 / 0.5000 / 0.0000
- nonzero rows/cols, sweep/gap: 4/3, 3/1
- overlap/symmetry/complexity/gesture: 0.2727 / 0.7500 / 40 / 11
- canonical: [{"colMask":5,"rowMask":15},{"colMask":6,"rowMask":13}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
◆ ◆ · ·
◆ · ◆ ·
◆ ◆ · ·
◆ ◆ · ·

DIFFERENCE
◆ ◆ · ·
◆ · ◆ ·
◆ ◆ · ·
◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-04

- titleKey: `level.lab.echo.04.title`
- chapter/order: `echo/4`
- candidate attempt: 19
- size/rank/difficulty: 4×4 / 2 / normal
- tags: dense, asymmetric, overlap
- density/target/initial: 0.6250 / 0.6250 / 0.0000
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.2857 / 0.7500 / 41 / 12
- canonical: [{"colMask":13,"rowMask":14},{"colMask":14,"rowMask":7}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· ◆ ◆ ◆
◆ ◆ · ·
◆ ◆ · ·
◆ · ◆ ◆

DIFFERENCE
· ◆ ◆ ◆
◆ ◆ · ·
◆ ◆ · ·
◆ · ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-05

- titleKey: `level.lab.echo.05.title`
- chapter/order: `echo/5`
- candidate attempt: 0
- size/rank/difficulty: 5×5 / 2 / normal
- tags: sparse, asymmetric, overlap
- density/target/initial: 0.3200 / 0.3200 / 0.0000
- nonzero rows/cols, sweep/gap: 3/4, 3/1
- overlap/symmetry/complexity/gesture: 0.1111 / 0.6800 / 41 / 9
- canonical: [{"colMask":10,"rowMask":17},{"colMask":28,"rowMask":3}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· ◆ ◆ · ◆
· · ◆ ◆ ◆
· · · · ·
· · · · ·
· ◆ · ◆ ·

DIFFERENCE
· ◆ ◆ · ◆
· · ◆ ◆ ◆
· · · · ·
· · · · ·
· ◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-06

- titleKey: `level.lab.echo.06.title`
- chapter/order: `echo/6`
- candidate attempt: 50
- size/rank/difficulty: 5×5 / 2 / normal
- tags: dense, symmetric, overlap
- density/target/initial: 0.5600 / 0.5600 / 0.0000
- nonzero rows/cols, sweep/gap: 5/4, 4/2
- overlap/symmetry/complexity/gesture: 0.1250 / 1.0000 / 41 / 12
- canonical: [{"colMask":17,"rowMask":7},{"colMask":26,"rowMask":27}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ ◆ · ◆ ·
◆ ◆ · ◆ ·
◆ · · · ◆
· ◆ · ◆ ◆
· ◆ · ◆ ◆

DIFFERENCE
◆ ◆ · ◆ ·
◆ ◆ · ◆ ·
◆ · · · ◆
· ◆ · ◆ ◆
· ◆ · ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-07

- titleKey: `level.lab.echo.07.title`
- chapter/order: `echo/7`
- candidate attempt: 0
- size/rank/difficulty: 5×5 / 3 / normal
- tags: dense, asymmetric, overlap
- density/target/initial: 0.6400 / 0.6400 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.0588 / 0.6000 / 61 / 15
- canonical: [{"colMask":5,"rowMask":7},{"colMask":18,"rowMask":19},{"colMask":24,"rowMask":28}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ ◆ ◆ · ◆
◆ ◆ ◆ · ◆
◆ · ◆ ◆ ◆
· · · ◆ ◆
· ◆ · ◆ ·

DIFFERENCE
◆ ◆ ◆ · ◆
◆ ◆ ◆ · ◆
◆ · ◆ ◆ ◆
· · · ◆ ◆
· ◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-08

- titleKey: `level.lab.echo.08.title`
- chapter/order: `echo/8`
- candidate attempt: 8
- size/rank/difficulty: 5×5 / 3 / normal
- tags: dense, asymmetric, overlap
- density/target/initial: 0.5600 / 0.5600 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1250 / 0.5200 / 63 / 15
- canonical: [{"colMask":9,"rowMask":15},{"colMask":18,"rowMask":20},{"colMask":12,"rowMask":28}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ · · ◆ ·
◆ · · ◆ ·
◆ ◆ ◆ · ◆
◆ · ◆ · ·
· ◆ ◆ ◆ ◆

DIFFERENCE
◆ · · ◆ ·
◆ · · ◆ ·
◆ ◆ ◆ · ◆
◆ · ◆ · ·
· ◆ ◆ ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-09

- titleKey: `level.lab.echo.09.title`
- chapter/order: `echo/9`
- candidate attempt: 3
- size/rank/difficulty: 5×5 / 3 / hard
- tags: dense, symmetric, overlap
- density/target/initial: 0.6800 / 0.6800 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1500 / 1.0000 / 61 / 17
- canonical: [{"colMask":9,"rowMask":23},{"colMask":18,"rowMask":19},{"colMask":28,"rowMask":14}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ ◆ · ◆ ◆
◆ ◆ ◆ · ·
◆ · ◆ · ◆
· · ◆ ◆ ◆
◆ ◆ · ◆ ◆

DIFFERENCE
◆ ◆ · ◆ ◆
◆ ◆ ◆ · ·
◆ · ◆ · ◆
· · ◆ ◆ ◆
◆ ◆ · ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-10

- titleKey: `level.lab.echo.10.title`
- chapter/order: `echo/10`
- candidate attempt: 4
- size/rank/difficulty: 5×5 / 3 / hard
- tags: asymmetric, overlap
- density/target/initial: 0.5200 / 0.5200 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1333 / 0.7600 / 61 / 14
- canonical: [{"colMask":25,"rowMask":5},{"colMask":26,"rowMask":14},{"colMask":12,"rowMask":16}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ · · ◆ ◆
· ◆ · ◆ ◆
◆ ◆ · · ·
· ◆ · ◆ ◆
· · ◆ ◆ ·

DIFFERENCE
◆ · · ◆ ◆
· ◆ · ◆ ◆
◆ ◆ · · ·
· ◆ · ◆ ◆
· · ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-11

- titleKey: `level.lab.echo.11.title`
- chapter/order: `echo/11`
- candidate attempt: 47
- size/rank/difficulty: 6×6 / 3 / hard
- tags: dense, symmetric, overlap
- density/target/initial: 0.5556 / 0.5556 / 0.0000
- nonzero rows/cols, sweep/gap: 6/6, 6/3
- overlap/symmetry/complexity/gesture: 0.1667 / 1.0000 / 65 / 18
- canonical: [{"colMask":33,"rowMask":9},{"colMask":38,"rowMask":54},{"colMask":56,"rowMask":27}]

```text
INITIAL
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·

TARGET
◆ · · ◆ ◆ ·
· ◆ ◆ ◆ ◆ ·
· ◆ ◆ · · ◆
◆ · · ◆ ◆ ·
· ◆ ◆ ◆ ◆ ·
· ◆ ◆ · · ◆

DIFFERENCE
◆ · · ◆ ◆ ·
· ◆ ◆ ◆ ◆ ·
· ◆ ◆ · · ◆
◆ · · ◆ ◆ ·
· ◆ ◆ ◆ ◆ ·
· ◆ ◆ · · ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-02-echo-12

- titleKey: `level.lab.echo.12.title`
- chapter/order: `echo/12`
- candidate attempt: 14
- size/rank/difficulty: 6×6 / 3 / hard
- tags: dense, asymmetric, overlap
- density/target/initial: 0.6111 / 0.6111 / 0.0000
- nonzero rows/cols, sweep/gap: 6/6, 6/3
- overlap/symmetry/complexity/gesture: 0.1538 / 0.5556 / 68 / 19
- canonical: [{"colMask":41,"rowMask":47},{"colMask":50,"rowMask":46},{"colMask":4,"rowMask":21}]

```text
INITIAL
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·

TARGET
◆ · ◆ ◆ · ◆
◆ ◆ · ◆ ◆ ·
◆ ◆ ◆ ◆ ◆ ·
◆ ◆ · ◆ ◆ ·
· · ◆ · · ·
◆ ◆ · ◆ ◆ ·

DIFFERENCE
◆ · ◆ ◆ · ◆
◆ ◆ · ◆ ◆ ·
◆ ◆ ◆ ◆ ◆ ·
◆ ◆ · ◆ ◆ ·
· · ◆ · · ·
◆ ◆ · ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-01

- titleKey: `level.lab.rank.01.title`
- chapter/order: `rank/1`
- candidate attempt: 18
- size/rank/difficulty: 4×4 / 2 / normal
- tags: sparse, asymmetric
- density/target/initial: 0.3125 / 0.3125 / 0.0000
- nonzero rows/cols, sweep/gap: 3/3, 3/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.6250 / 35 / 6
- canonical: [{"colMask":5,"rowMask":10},{"colMask":8,"rowMask":4}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· · · ·
◆ · ◆ ·
· · · ◆
◆ · ◆ ·

DIFFERENCE
· · · ·
◆ · ◆ ·
· · · ◆
◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-02

- titleKey: `level.lab.rank.02.title`
- chapter/order: `rank/2`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 2 / normal
- tags: dense, symmetric, overlap
- density/target/initial: 0.6250 / 0.6250 / 0.0000
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.0909 / 1.0000 / 36 / 10
- canonical: [{"colMask":9,"rowMask":14},{"colMask":14,"rowMask":9}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· ◆ ◆ ◆
◆ · · ◆
◆ · · ◆
◆ ◆ ◆ ·

DIFFERENCE
· ◆ ◆ ◆
◆ · · ◆
◆ · · ◆
◆ ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-03

- titleKey: `level.lab.rank.03.title`
- chapter/order: `rank/3`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 2 / normal
- tags: asymmetric, overlap
- density/target/initial: 0.3750 / 0.3750 / 0.0000
- nonzero rows/cols, sweep/gap: 3/3, 3/1
- overlap/symmetry/complexity/gesture: 0.1429 / 0.5000 / 38 / 8
- canonical: [{"colMask":9,"rowMask":4},{"colMask":12,"rowMask":7}]

```text
INITIAL
· · · ·
· · · ·
· · · ·
· · · ·

TARGET
· · ◆ ◆
· · ◆ ◆
◆ · ◆ ·
· · · ·

DIFFERENCE
· · ◆ ◆
· · ◆ ◆
◆ · ◆ ·
· · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-04

- titleKey: `level.lab.rank.04.title`
- chapter/order: `rank/4`
- candidate attempt: 3
- size/rank/difficulty: 5×5 / 2 / normal
- tags: dense, asymmetric, overlap
- density/target/initial: 0.5600 / 0.5600 / 0.0000
- nonzero rows/cols, sweep/gap: 4/5, 4/2
- overlap/symmetry/complexity/gesture: 0.0667 / 0.7600 / 41 / 11
- canonical: [{"colMask":5,"rowMask":12},{"colMask":30,"rowMask":26}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· · · · ·
· ◆ ◆ ◆ ◆
◆ · ◆ · ·
◆ ◆ · ◆ ◆
· ◆ ◆ ◆ ◆

DIFFERENCE
· · · · ·
· ◆ ◆ ◆ ◆
◆ · ◆ · ·
◆ ◆ · ◆ ◆
· ◆ ◆ ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-05

- titleKey: `level.lab.rank.05.title`
- chapter/order: `rank/5`
- candidate attempt: 0
- size/rank/difficulty: 5×5 / 3 / normal
- tags: sparse, asymmetric
- density/target/initial: 0.3200 / 0.3200 / 0.0000
- nonzero rows/cols, sweep/gap: 5/4, 4/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.8400 / 58 / 10
- canonical: [{"colMask":17,"rowMask":5},{"colMask":2,"rowMask":24},{"colMask":4,"rowMask":6}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
◆ · · · ◆
· · ◆ · ·
◆ · ◆ · ◆
· ◆ · · ·
· ◆ · · ·

DIFFERENCE
◆ · · · ◆
· · ◆ · ·
◆ · ◆ · ◆
· ◆ · · ·
· ◆ · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-06

- titleKey: `level.lab.rank.06.title`
- chapter/order: `rank/6`
- candidate attempt: 4
- size/rank/difficulty: 5×5 / 3 / hard
- tags: dense, symmetric, overlap
- density/target/initial: 0.6800 / 0.6800 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1579 / 1.0000 / 60 / 16
- canonical: [{"colMask":17,"rowMask":28},{"colMask":26,"rowMask":31},{"colMask":20,"rowMask":4}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· ◆ · ◆ ◆
· ◆ · ◆ ◆
◆ ◆ ◆ ◆ ◆
◆ ◆ · ◆ ·
◆ ◆ · ◆ ·

DIFFERENCE
· ◆ · ◆ ◆
· ◆ · ◆ ◆
◆ ◆ ◆ ◆ ◆
◆ ◆ · ◆ ·
◆ ◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-07

- titleKey: `level.lab.rank.07.title`
- chapter/order: `rank/7`
- candidate attempt: 0
- size/rank/difficulty: 5×5 / 3 / hard
- tags: dense, asymmetric, overlap
- density/target/initial: 0.6000 / 0.6000 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1667 / 0.6800 / 63 / 16
- canonical: [{"colMask":21,"rowMask":22},{"colMask":6,"rowMask":15},{"colMask":24,"rowMask":5}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· ◆ ◆ ◆ ◆
◆ ◆ · · ◆
◆ ◆ · ◆ ·
· ◆ ◆ · ·
◆ · ◆ · ◆

DIFFERENCE
· ◆ ◆ ◆ ◆
◆ ◆ · · ◆
◆ ◆ · ◆ ·
· ◆ ◆ · ·
◆ · ◆ · ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-08

- titleKey: `level.lab.rank.08.title`
- chapter/order: `rank/8`
- candidate attempt: 2
- size/rank/difficulty: 5×5 / 3 / hard
- tags: dense, asymmetric, overlap
- density/target/initial: 0.5600 / 0.5600 / 0.0000
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1250 / 0.7600 / 61 / 15
- canonical: [{"colMask":13,"rowMask":20},{"colMask":14,"rowMask":19},{"colMask":16,"rowMask":28}]

```text
INITIAL
· · · · ·
· · · · ·
· · · · ·
· · · · ·
· · · · ·

TARGET
· ◆ ◆ ◆ ·
· ◆ ◆ ◆ ·
◆ · ◆ ◆ ◆
· · · · ◆
◆ ◆ · · ◆

DIFFERENCE
· ◆ ◆ ◆ ·
· ◆ ◆ ◆ ·
◆ · ◆ ◆ ◆
· · · · ◆
◆ ◆ · · ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-09

- titleKey: `level.lab.rank.09.title`
- chapter/order: `rank/9`
- candidate attempt: 0
- size/rank/difficulty: 6×6 / 3 / hard
- tags: sparse, asymmetric
- density/target/initial: 0.3333 / 0.3333 / 0.0000
- nonzero rows/cols, sweep/gap: 6/6, 6/3
- overlap/symmetry/complexity/gesture: 0.0000 / 0.5556 / 64 / 12
- canonical: [{"colMask":17,"rowMask":20},{"colMask":34,"rowMask":3},{"colMask":12,"rowMask":40}]

```text
INITIAL
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·

TARGET
· ◆ · · · ◆
· ◆ · · · ◆
◆ · · · ◆ ·
· · ◆ ◆ · ·
◆ · · · ◆ ·
· · ◆ ◆ · ·

DIFFERENCE
· ◆ · · · ◆
· ◆ · · · ◆
◆ · · · ◆ ·
· · ◆ ◆ · ·
◆ · · · ◆ ·
· · ◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-10

- titleKey: `level.lab.rank.10.title`
- chapter/order: `rank/10`
- candidate attempt: 6
- size/rank/difficulty: 6×6 / 4 / hard
- tags: dense, symmetric, overlap
- density/target/initial: 0.5556 / 0.5556 / 0.0000
- nonzero rows/cols, sweep/gap: 6/6, 6/2
- overlap/symmetry/complexity/gesture: 0.1304 / 1.0000 / 84 / 21
- canonical: [{"colMask":5,"rowMask":40},{"colMask":6,"rowMask":21},{"colMask":40,"rowMask":47},{"colMask":48,"rowMask":42}]

```text
INITIAL
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·

TARGET
· ◆ ◆ ◆ · ◆
· · · ◆ ◆ ·
· ◆ ◆ ◆ · ◆
◆ · ◆ ◆ ◆ ·
· ◆ ◆ · · ·
◆ · ◆ ◆ ◆ ·

DIFFERENCE
· ◆ ◆ ◆ · ◆
· · · ◆ ◆ ·
· ◆ ◆ ◆ · ◆
◆ · ◆ ◆ ◆ ·
· ◆ ◆ · · ·
◆ · ◆ ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-11

- titleKey: `level.lab.rank.11.title`
- chapter/order: `rank/11`
- candidate attempt: 4
- size/rank/difficulty: 6×6 / 4 / master
- tags: asymmetric, overlap
- density/target/initial: 0.4167 / 0.4167 / 0.0000
- nonzero rows/cols, sweep/gap: 6/6, 6/2
- overlap/symmetry/complexity/gesture: 0.1667 / 0.5000 / 87 / 19
- canonical: [{"colMask":33,"rowMask":6},{"colMask":50,"rowMask":18},{"colMask":4,"rowMask":13},{"colMask":24,"rowMask":54}]

```text
INITIAL
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·

TARGET
· · ◆ · · ·
◆ ◆ · ◆ · ·
◆ · ◆ ◆ ◆ ◆
· · ◆ · · ·
· ◆ · ◆ · ◆
· · · ◆ ◆ ·

DIFFERENCE
· · ◆ · · ·
◆ ◆ · ◆ · ·
◆ · ◆ ◆ ◆ ◆
· · ◆ · · ·
· ◆ · ◆ · ◆
· · · ◆ ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-03-rank-12

- titleKey: `level.lab.rank.12.title`
- chapter/order: `rank/12`
- candidate attempt: 32
- size/rank/difficulty: 6×6 / 4 / master
- tags: dense, asymmetric, overlap
- density/target/initial: 0.6667 / 0.6667 / 0.0000
- nonzero rows/cols, sweep/gap: 6/6, 6/2
- overlap/symmetry/complexity/gesture: 0.1600 / 0.7778 / 86 / 24
- canonical: [{"colMask":9,"rowMask":31},{"colMask":10,"rowMask":29},{"colMask":12,"rowMask":28},{"colMask":48,"rowMask":60}]

```text
INITIAL
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·
· · · · · ·

TARGET
◆ ◆ · · · ·
◆ · · ◆ · ·
◆ ◆ ◆ ◆ ◆ ◆
◆ ◆ ◆ ◆ ◆ ◆
◆ ◆ ◆ ◆ ◆ ◆
· · · · ◆ ◆

DIFFERENCE
◆ ◆ · · · ·
◆ · · ◆ · ·
◆ ◆ ◆ ◆ ◆ ◆
◆ ◆ ◆ ◆ ◆ ◆
◆ ◆ ◆ ◆ ◆ ◆
· · · · ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-01

- titleKey: `level.lab.noise.01.title`
- chapter/order: `noise/1`
- candidate attempt: 16
- size/rank/difficulty: 4×4 / 1 / easy
- tags: sparse, symmetric, noise
- density/target/initial: 0.2500 / 0.3750 / 0.1250
- nonzero rows/cols, sweep/gap: 2/2, 2/1
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 15 / 4
- canonical: [{"colMask":5,"rowMask":9}]

```text
INITIAL
· · · ◆
· · · ·
· · ◆ ·
· · · ·

TARGET
◆ · ◆ ◆
· · · ·
· · ◆ ·
◆ · ◆ ·

DIFFERENCE
◆ · ◆ ·
· · · ·
· · · ·
◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-02

- titleKey: `level.lab.noise.02.title`
- chapter/order: `noise/2`
- candidate attempt: 6
- size/rank/difficulty: 4×4 / 2 / easy
- tags: symmetric, noise
- density/target/initial: 0.5000 / 0.6250 / 0.2500
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 36 / 8
- canonical: [{"colMask":5,"rowMask":3},{"colMask":10,"rowMask":12}]

```text
INITIAL
◆ · · ◆
· · · ◆
◆ · · ·
· · · ·

TARGET
· · ◆ ◆
◆ · ◆ ◆
◆ ◆ · ◆
· ◆ · ◆

DIFFERENCE
◆ · ◆ ·
◆ · ◆ ·
· ◆ · ◆
· ◆ · ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-03

- titleKey: `level.lab.noise.03.title`
- chapter/order: `noise/3`
- candidate attempt: 0
- size/rank/difficulty: 4×4 / 2 / normal
- tags: asymmetric, noise
- density/target/initial: 0.4375 / 0.4375 / 0.1250
- nonzero rows/cols, sweep/gap: 2/4, 2/0
- overlap/symmetry/complexity/gesture: 0.0000 / 0.8750 / 35 / 7
- canonical: [{"colMask":11,"rowMask":9},{"colMask":4,"rowMask":8}]

```text
INITIAL
· · · ◆
· · · ◆
· · · ·
· · · ·

TARGET
◆ ◆ · ·
· · · ◆
· · · ·
◆ ◆ ◆ ◆

DIFFERENCE
◆ ◆ · ◆
· · · ·
· · · ·
◆ ◆ ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-04

- titleKey: `level.lab.noise.04.title`
- chapter/order: `noise/4`
- candidate attempt: 12
- size/rank/difficulty: 4×4 / 2 / normal
- tags: dense, asymmetric, overlap, noise
- density/target/initial: 0.5625 / 0.5000 / 0.1875
- nonzero rows/cols, sweep/gap: 4/4, 4/2
- overlap/symmetry/complexity/gesture: 0.4000 / 0.6250 / 45 / 13
- canonical: [{"colMask":13,"rowMask":11},{"colMask":14,"rowMask":15}]

```text
INITIAL
· · · ·
· · · ·
· ◆ · ·
◆ · · ◆

TARGET
◆ ◆ · ·
◆ ◆ · ·
· · ◆ ◆
· ◆ · ◆

DIFFERENCE
◆ ◆ · ·
◆ ◆ · ·
· ◆ ◆ ◆
◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-05

- titleKey: `level.lab.noise.05.title`
- chapter/order: `noise/5`
- candidate attempt: 0
- size/rank/difficulty: 5×5 / 2 / normal
- tags: sparse, symmetric, noise
- density/target/initial: 0.2400 / 0.2800 / 0.3600
- nonzero rows/cols, sweep/gap: 4/3, 3/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.9200 / 40 / 8
- canonical: [{"colMask":1,"rowMask":15},{"colMask":20,"rowMask":4}]

```text
INITIAL
◆ ◆ ◆ · ·
◆ · ◆ · ·
◆ · ◆ · ·
· · · ◆ ·
· · · ◆ ·

TARGET
· ◆ ◆ · ·
· · ◆ · ·
· · · · ◆
◆ · · ◆ ·
· · · ◆ ·

DIFFERENCE
◆ · · · ·
◆ · · · ·
◆ · ◆ · ◆
◆ · · · ·
· · · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-06

- titleKey: `level.lab.noise.06.title`
- chapter/order: `noise/6`
- candidate attempt: 26
- size/rank/difficulty: 5×5 / 2 / normal
- tags: sparse, symmetric, noise
- density/target/initial: 0.2400 / 0.3600 / 0.3600
- nonzero rows/cols, sweep/gap: 2/5, 2/0
- overlap/symmetry/complexity/gesture: 0.0000 / 1.0000 / 40 / 8
- canonical: [{"colMask":13,"rowMask":8},{"colMask":22,"rowMask":2}]

```text
INITIAL
· · · ◆ ·
· ◆ · · ·
◆ · · · ·
◆ ◆ · ◆ ◆
◆ · · · ◆

TARGET
· · · ◆ ·
· · ◆ · ◆
◆ · · · ·
· ◆ ◆ · ◆
◆ · · · ◆

DIFFERENCE
· · · · ·
· ◆ ◆ · ◆
· · · · ·
◆ · ◆ ◆ ·
· · · · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-07

- titleKey: `level.lab.noise.07.title`
- chapter/order: `noise/7`
- candidate attempt: 1
- size/rank/difficulty: 5×5 / 3 / normal
- tags: sparse, asymmetric, noise
- density/target/initial: 0.2800 / 0.5600 / 0.2800
- nonzero rows/cols, sweep/gap: 4/4, 4/1
- overlap/symmetry/complexity/gesture: 0.0000 / 0.7600 / 61 / 10
- canonical: [{"colMask":1,"rowMask":19},{"colMask":18,"rowMask":1},{"colMask":8,"rowMask":20}]

```text
INITIAL
· · · ◆ ·
· ◆ · · ◆
· · · · ·
◆ · ◆ ◆ ·
· · ◆ · ·

TARGET
◆ ◆ · ◆ ◆
◆ ◆ · · ◆
· · · ◆ ·
◆ · ◆ ◆ ·
◆ · ◆ ◆ ·

DIFFERENCE
◆ ◆ · · ◆
◆ · · · ·
· · · ◆ ·
· · · · ·
◆ · · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-08

- titleKey: `level.lab.noise.08.title`
- chapter/order: `noise/8`
- candidate attempt: 5
- size/rank/difficulty: 5×5 / 3 / hard
- tags: symmetric, overlap, noise
- density/target/initial: 0.5200 / 0.4800 / 0.3600
- nonzero rows/cols, sweep/gap: 5/5, 5/2
- overlap/symmetry/complexity/gesture: 0.1333 / 1.0000 / 63 / 14
- canonical: [{"colMask":9,"rowMask":31},{"colMask":14,"rowMask":17},{"colMask":16,"rowMask":4}]

```text
INITIAL
· · · · ◆
· · · ◆ ·
◆ · ◆ ◆ ·
· · · ◆ ◆
· · ◆ · ◆

TARGET
◆ ◆ ◆ · ◆
◆ · · · ·
· · ◆ · ◆
◆ · · · ◆
◆ ◆ · · ◆

DIFFERENCE
◆ ◆ ◆ · ·
◆ · · ◆ ·
◆ · · ◆ ◆
◆ · · ◆ ·
◆ ◆ ◆ · ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-09

- titleKey: `level.lab.noise.09.title`
- chapter/order: `noise/9`
- candidate attempt: 0
- size/rank/difficulty: 6×6 / 3 / hard
- tags: sparse, asymmetric, noise
- density/target/initial: 0.3333 / 0.3889 / 0.3333
- nonzero rows/cols, sweep/gap: 6/6, 6/3
- overlap/symmetry/complexity/gesture: 0.0000 / 0.6667 / 66 / 12
- canonical: [{"colMask":3,"rowMask":10},{"colMask":20,"rowMask":17},{"colMask":40,"rowMask":36}]

```text
INITIAL
· ◆ · · · ·
◆ · · · · ◆
· ◆ · ◆ · ◆
· ◆ · · ◆ ·
◆ ◆ ◆ · · ·
· · · · ◆ ·

TARGET
· ◆ ◆ · ◆ ·
· ◆ · · · ◆
· ◆ · · · ·
◆ · · · ◆ ·
◆ ◆ · · ◆ ·
· · · ◆ ◆ ◆

DIFFERENCE
· · ◆ · ◆ ·
◆ ◆ · · · ·
· · · ◆ · ◆
◆ ◆ · · · ·
· · ◆ · ◆ ·
· · · ◆ · ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-10

- titleKey: `level.lab.noise.10.title`
- chapter/order: `noise/10`
- candidate attempt: 18
- size/rank/difficulty: 6×6 / 3 / hard
- tags: dense, symmetric, overlap, noise
- density/target/initial: 0.5556 / 0.4444 / 0.4444
- nonzero rows/cols, sweep/gap: 6/6, 6/3
- overlap/symmetry/complexity/gesture: 0.1667 / 1.0000 / 69 / 18
- canonical: [{"colMask":5,"rowMask":53},{"colMask":54,"rowMask":51},{"colMask":40,"rowMask":24}]

```text
INITIAL
· · · ◆ · ·
· ◆ ◆ ◆ · ◆
◆ · ◆ · · ◆
· · ◆ · ◆ ◆
· ◆ · · ◆ ·
· ◆ · ◆ ◆ ·

TARGET
◆ ◆ · ◆ ◆ ◆
· · · ◆ ◆ ·
· · · · · ◆
· · ◆ ◆ ◆ ·
◆ · · ◆ · ·
◆ · · ◆ · ◆

DIFFERENCE
◆ ◆ · · ◆ ◆
· ◆ ◆ · ◆ ◆
◆ · ◆ · · ·
· · · ◆ · ◆
◆ ◆ · ◆ ◆ ·
◆ ◆ · · ◆ ◆
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-11

- titleKey: `level.lab.noise.11.title`
- chapter/order: `noise/11`
- candidate attempt: 0
- size/rank/difficulty: 6×6 / 4 / master
- tags: dense, asymmetric, overlap, noise
- density/target/initial: 0.5556 / 0.5000 / 0.3333
- nonzero rows/cols, sweep/gap: 6/6, 6/2
- overlap/symmetry/complexity/gesture: 0.0909 / 0.7778 / 88 / 22
- canonical: [{"colMask":9,"rowMask":63},{"colMask":34,"rowMask":33},{"colMask":44,"rowMask":32},{"colMask":16,"rowMask":61}]

```text
INITIAL
· ◆ · · · ·
· ◆ ◆ ◆ · ◆
· · · · · ◆
◆ · · · · ·
◆ · · ◆ · ◆
· ◆ ◆ · · ·

TARGET
◆ · · ◆ ◆ ◆
◆ ◆ ◆ · · ◆
◆ · · ◆ ◆ ◆
· · · ◆ ◆ ·
· · · · ◆ ◆
◆ · · · ◆ ·

DIFFERENCE
◆ ◆ · ◆ ◆ ◆
◆ · · ◆ · ·
◆ · · ◆ ◆ ·
◆ · · ◆ ◆ ·
◆ · · ◆ ◆ ·
◆ ◆ ◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

### lab-04-noise-12

- titleKey: `level.lab.noise.12.title`
- chapter/order: `noise/12`
- candidate attempt: 1
- size/rank/difficulty: 6×6 / 4 / master
- tags: dense, asymmetric, overlap, noise
- density/target/initial: 0.6111 / 0.3333 / 0.3889
- nonzero rows/cols, sweep/gap: 6/6, 6/2
- overlap/symmetry/complexity/gesture: 0.2308 / 0.5556 / 91 / 24
- canonical: [{"colMask":25,"rowMask":60},{"colMask":10,"rowMask":31},{"colMask":12,"rowMask":59},{"colMask":32,"rowMask":20}]

```text
INITIAL
· ◆ ◆ · · ·
· · ◆ · ◆ ·
◆ · · · · ·
◆ ◆ ◆ ◆ ◆ ·
◆ ◆ · · · ◆
· · · ◆ · ·

TARGET
· · · · · ·
· ◆ · · ◆ ·
· ◆ · · ◆ ◆
· · · · · ·
· · ◆ ◆ ◆ ·
◆ · ◆ ◆ ◆ ·

DIFFERENCE
· ◆ ◆ · · ·
· ◆ ◆ · · ·
◆ ◆ · · ◆ ◆
◆ ◆ ◆ ◆ ◆ ·
◆ ◆ ◆ ◆ ◆ ◆
◆ · ◆ · ◆ ·
```

- Pattern readability: **PASS**
- Difficulty/progression: **PASS**
- Unpleasant or misleading pattern: **NONE**
- Human decision: **PASS**

## 완료 조건

- [x] 54/54 Pattern readability PASS
- [x] 54/54 Difficulty/progression PASS 또는 사람 근거를 남긴 재분류
- [x] Tutorial + Lab 4 chapter 학습 순서 5/5 PASS
- [x] replacement pending=0
- [x] reviewer/time/overall decision 기입

위 조건 전에는 M03 DOD-04를 완료로 표시하지 않는다.
