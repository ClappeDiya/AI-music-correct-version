# Music Generation Flow Diagrams
## Visual Documentation of the Unified Architecture

### 1. Main System Flow

```mermaid
graph TB
    Start([User Input]) --> PE{Prompt Enhancement<br/>Optional?}
    PE -->|Yes| APE[Automatic Prompt<br/>Enhancement]
    PE -->|No| DI[Direct Input<br/>Processing]

    APE --> CoT[Chain-of-Thought<br/>Processing]
    CoT --> EP[Enhanced Prompt]
    EP --> UC[Unified Composition<br/>Engine]
    DI --> UC

    UC --> SM[State Machine<br/>Controller]

    SM --> S1[Stage 1: Composition]
    S1 --> S2[Stage 2: Arrangement]
    S2 --> S3[Stage 3: Production]
    S3 --> S4[Stage 4: Mixing]
    S4 --> S5[Stage 5: Mastering]
    S5 --> S6[Stage 6: Finalization]

    S6 --> Output([Final Output])

    %% Feedback loops
    S2 -.->|Revise| S1
    S3 -.->|Revise| S2
    S4 -.->|Revise| S3
    S5 -.->|Revise| S4
    S6 -.->|Revise| S5

    %% Context flow
    UC --> Context[(Shared Context<br/>Database)]
    Context --> S1
    Context --> S2
    Context --> S3
    Context --> S4
    Context --> S5
    Context --> S6

    style APE fill:#e1f5fe
    style CoT fill:#e1f5fe
    style UC fill:#fff9c4
    style Context fill:#f3e5f5
    style Output fill:#c8e6c9
```

### 2. Automatic Prompt Enhancement Flow

```mermaid
graph LR
    subgraph "Chain-of-Thought Enhancement"
        UI[User Input] --> PI[Parse Intent]
        PI --> ME[Extract Musical<br/>Elements]
        ME --> UH[Apply User<br/>History]
        UH --> MT[Apply Music<br/>Theory]
        MT --> TP[Generate Technical<br/>Parameters]
        TP --> SP[Structured<br/>Prompt]
    end

    subgraph "Enhancement Components"
        ME --> Genre[Genre Detection]
        ME --> Mood[Mood Analysis]
        ME --> Inst[Instrument<br/>Recognition]
        ME --> Tempo[Tempo/Rhythm<br/>Extraction]

        MT --> Harm[Harmony Rules]
        MT --> Struct[Structure<br/>Templates]
        MT --> Prog[Progression<br/>Patterns]
    end

    subgraph "Knowledge Bases"
        KB1[(Music Theory<br/>Database)]
        KB2[(User Preference<br/>Database)]
        KB3[(Genre/Style<br/>Database)]

        KB1 --> MT
        KB2 --> UH
        KB3 --> ME
    end

    SP --> Output[Enhanced Prompt<br/>with Parameters]

    style UI fill:#e3f2fd
    style SP fill:#fce4ec
    style Output fill:#e8f5e9
```

### 3. Production Pipeline Stage Flow

```mermaid
graph TD
    subgraph "Stage 1: Composition"
        C1[Receive Enhanced<br/>Prompt] --> C2[Generate Chord<br/>Progression]
        C2 --> C3[Create Melody]
        C3 --> C4[Develop Bass Line]
        C4 --> C5[Design Rhythm<br/>Pattern]
        C5 --> C6[Add Harmonies]
    end

    subgraph "Stage 2: Arrangement"
        A1[Load Composition<br/>Elements] --> A2[Define Song<br/>Structure]
        A2 --> A3[Create Sections<br/>Intro/Verse/Chorus]
        A3 --> A4[Design Transitions]
        A4 --> A5[Plan Dynamics]
        A5 --> A6[Setup Automation]
    end

    subgraph "Stage 3: Production"
        P1[Load Arrangement] --> P2[Select Instruments]
        P2 --> P3[Apply Sound<br/>Design]
        P3 --> P4[Add Effects]
        P4 --> P5[Create Layers]
        P5 --> P6[Add Textures]
    end

    subgraph "Stage 4: Mixing"
        M1[Load Production] --> M2[Balance Levels]
        M2 --> M3[Apply EQ]
        M3 --> M4[Add Compression]
        M4 --> M5[Position in<br/>Stereo Field]
        M5 --> M6[Add Reverb/<br/>Space]
    end

    subgraph "Stage 5: Mastering"
        MA1[Load Mix] --> MA2[Master EQ]
        MA2 --> MA3[Master<br/>Compression]
        MA3 --> MA4[Limiting]
        MA4 --> MA5[Loudness<br/>Optimization]
        MA5 --> MA6[Stereo<br/>Enhancement]
    end

    C6 --> A1
    A6 --> P1
    P6 --> M1
    M6 --> MA1
    MA6 --> Final([Final Master])

    style C1 fill:#e1f5fe
    style A1 fill:#fff3e0
    style P1 fill:#f3e5f5
    style M1 fill:#e8f5e9
    style MA1 fill:#fce4ec
    style Final fill:#c8e6c9
```

### 4. Context Propagation Flow

```mermaid
graph LR
    subgraph "Context Data Structure"
        Context[Shared Context] --> Musical[Musical Context]
        Context --> Technical[Technical Context]
        Context --> Creative[Creative Context]
        Context --> AI[AI Decisions]

        Musical --> Key[Key/Scale]
        Musical --> Tempo[Tempo/BPM]
        Musical --> Time[Time Signature]
        Musical --> Genre[Genre/Style]
        Musical --> Mood[Mood/Energy]

        Technical --> SR[Sample Rate]
        Technical --> Bit[Bit Depth]
        Technical --> Format[Audio Format]
        Technical --> Dur[Duration]

        Creative --> Insp[Inspiration]
        Creative --> Ref[References]
        Creative --> Const[Constraints]
        Creative --> Pref[Preferences]

        AI --> Prompt[Prompt Enhancement]
        AI --> Params[Generation Params]
        AI --> Models[Model Selections]
    end

    subgraph "Stage Access"
        S1[Composition] -.-> Context
        S2[Arrangement] -.-> Context
        S3[Production] -.-> Context
        S4[Mixing] -.-> Context
        S5[Mastering] -.-> Context

        S1 --> UPD1[Update Context]
        S2 --> UPD2[Update Context]
        S3 --> UPD3[Update Context]
        S4 --> UPD4[Update Context]
        S5 --> UPD5[Update Context]

        UPD1 --> Context
        UPD2 --> Context
        UPD3 --> Context
        UPD4 --> Context
        UPD5 --> Context
    end

    style Context fill:#f3e5f5
    style Musical fill:#e1f5fe
    style Technical fill:#fff3e0
    style Creative fill:#e8f5e9
    style AI fill:#fce4ec
```

### 5. AI Provider Routing Flow

```mermaid
graph TD
    Request[Generation Request] --> Router{Unified AI Router}

    Router --> Analyze[Analyze Task Type]
    Analyze --> Select[Select Best Provider]

    Select --> P1{Task Type?}

    P1 -->|Full Song| Suno[Suno V5 API]
    P1 -->|Vocals| Udio[Udio API]
    P1 -->|Instrumental| MusicGen[MusicGen API]
    P1 -->|Lyrics| OpenAI[OpenAI GPT-4]
    P1 -->|Enhancement| Anthropic[Anthropic Claude]
    P1 -->|Ambience| Stable[Stable Audio]

    Suno --> Process1[Process with Suno]
    Udio --> Process2[Process with Udio]
    MusicGen --> Process3[Process with MusicGen]
    OpenAI --> Process4[Process with OpenAI]
    Anthropic --> Process5[Process with Anthropic]
    Stable --> Process6[Process with Stable]

    Process1 --> Combine[Combine Results]
    Process2 --> Combine
    Process3 --> Combine
    Process4 --> Combine
    Process5 --> Combine
    Process6 --> Combine

    Combine --> Output[Unified Output]

    subgraph "Provider Capabilities"
        Cap1[Suno: Complete songs<br/>with vocals]
        Cap2[Udio: High-quality<br/>hierarchical generation]
        Cap3[MusicGen: Open-source<br/>instrumental]
        Cap4[OpenAI: Lyrics and<br/>text generation]
        Cap5[Anthropic: Prompt<br/>enhancement]
        Cap6[Stable: Diffusion-based<br/>audio generation]
    end

    style Router fill:#fff9c4
    style Combine fill:#e8f5e9
    style Output fill:#c8e6c9
```

### 6. User Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend UI
    participant API as API Gateway
    participant PE as Prompt Enhancer
    participant UC as Unified Composer
    participant PS as Pipeline Stages
    participant AP as AI Providers
    participant DB as Database

    U->>UI: Enter music description
    UI->>API: Send request
    API->>PE: Process input

    alt Automatic Enhancement ON
        PE->>PE: Chain-of-Thought processing
        PE->>API: Return enhanced prompt
    else Enhancement OFF
        PE->>API: Return original input
    end

    API->>UC: Create composition
    UC->>DB: Store composition
    UC->>PS: Start pipeline

    loop For each stage
        PS->>PS: Process stage
        PS->>DB: Update context
        PS->>AP: Call AI services
        AP->>PS: Return results
        PS->>UI: Send progress update
        U->>UI: Monitor progress

        alt User requests revision
            U->>UI: Request changes
            UI->>PS: Apply modifications
            PS->>PS: Re-process stage
        end
    end

    PS->>UC: Pipeline complete
    UC->>DB: Save final version
    UC->>API: Return results
    API->>UI: Send final output
    UI->>U: Display/Download music
```

### 7. Version Control Flow

```mermaid
graph TD
    subgraph "Version Management"
        V1[Version 1<br/>Initial] --> V2[Version 2<br/>Modified Arrangement]
        V2 --> V3[Version 3<br/>Different Mix]
        V2 --> V4[Version 4<br/>Alternative Style]
        V3 --> V5[Version 5<br/>Final Master]
        V4 --> V6[Version 6<br/>Remix]
    end

    subgraph "Branching Strategy"
        Main[Main Composition] --> Branch1[Experimental<br/>Branch]
        Main --> Branch2[Alternative<br/>Genre Branch]
        Branch1 --> Merge1{Merge?}
        Branch2 --> Merge2{Merge?}
        Merge1 -->|Yes| Main
        Merge2 -->|Yes| Main
    end

    subgraph "Storage"
        DB[(Database)]
        FS[(File Storage)]

        V1 --> DB
        V2 --> DB
        V3 --> DB
        V4 --> DB
        V5 --> DB
        V6 --> DB

        V1 --> FS
        V2 --> FS
        V3 --> FS
        V4 --> FS
        V5 --> FS
        V6 --> FS
    end

    style V5 fill:#c8e6c9
    style Main fill:#fff9c4
```

### 8. Real-time Collaboration Flow

```mermaid
graph LR
    subgraph "User 1"
        U1[User 1 Client] --> WS1[WebSocket<br/>Connection]
    end

    subgraph "User 2"
        U2[User 2 Client] --> WS2[WebSocket<br/>Connection]
    end

    subgraph "User 3"
        U3[User 3 Client] --> WS3[WebSocket<br/>Connection]
    end

    subgraph "Server"
        WS1 --> CS[Collaboration<br/>Server]
        WS2 --> CS
        WS3 --> CS

        CS --> SM[Session<br/>Manager]
        CS --> CM[Change<br/>Manager]
        CS --> VM[Version<br/>Manager]

        SM --> Session[(Active Sessions)]
        CM --> Changes[(Change History)]
        VM --> Versions[(Version Tree)]
    end

    subgraph "Operations"
        Op1[Edit Melody]
        Op2[Change Tempo]
        Op3[Add Instrument]
        Op4[Adjust Mix]

        Op1 --> CM
        Op2 --> CM
        Op3 --> CM
        Op4 --> CM
    end

    CS --> Broadcast[Broadcast Changes]
    Broadcast --> U1
    Broadcast --> U2
    Broadcast --> U3

    style CS fill:#fff9c4
    style Broadcast fill:#e8f5e9
```

### 9. Error Handling and Recovery Flow

```mermaid
graph TD
    Stage[Pipeline Stage] --> Process{Process Stage}
    Process -->|Success| Next[Next Stage]
    Process -->|Error| Error{Error Type?}

    Error -->|Transient| Retry[Retry Logic]
    Error -->|Provider| Fallback[Fallback Provider]
    Error -->|Invalid| Validate[Re-validate Input]
    Error -->|Resource| Queue[Queue for Later]
    Error -->|Fatal| Abort[Abort Pipeline]

    Retry --> Count{Retry Count}
    Count -->|< 3| Process
    Count -->|>= 3| Fallback

    Fallback --> Alt[Alternative Provider]
    Alt --> Process

    Validate --> Fix[Fix Input]
    Fix --> Process

    Queue --> Wait[Wait for Resources]
    Wait --> Process

    Abort --> Notify[Notify User]
    Notify --> Save[Save Partial]
    Save --> Resume[Allow Resume]

    Next --> Complete[Stage Complete]

    style Error fill:#ffcdd2
    style Retry fill:#fff3e0
    style Fallback fill:#e1f5fe
    style Complete fill:#c8e6c9
```

### 10. Performance Optimization Flow

```mermaid
graph LR
    subgraph "Caching Layer"
        Input[User Input] --> Cache{In Cache?}
        Cache -->|Yes| Return[Return Cached]
        Cache -->|No| Process[Process Request]
        Process --> Store[Store in Cache]
        Store --> Return
    end

    subgraph "Parallel Processing"
        Comp[Composition] --> PP{Can Parallelize?}
        PP -->|Yes| P1[Process Melody]
        PP -->|Yes| P2[Process Rhythm]
        PP -->|Yes| P3[Process Harmony]
        PP -->|No| Sequential[Sequential Process]

        P1 --> Merge[Merge Results]
        P2 --> Merge
        P3 --> Merge
        Sequential --> Merge
    end

    subgraph "Resource Management"
        Queue1[High Priority Queue]
        Queue2[Normal Queue]
        Queue3[Low Priority Queue]

        Queue1 --> Worker1[Worker Pool 1]
        Queue2 --> Worker2[Worker Pool 2]
        Queue3 --> Worker3[Worker Pool 3]

        Worker1 --> GPU[GPU Resources]
        Worker2 --> GPU
        Worker3 --> CPU[CPU Resources]
    end

    style Cache fill:#e1f5fe
    style Merge fill:#e8f5e9
    style GPU fill:#fff3e0
```

## Legend

- **Blue boxes**: Input/Processing stages
- **Yellow boxes**: Core system components
- **Green boxes**: Output/Success states
- **Purple boxes**: Context/Storage
- **Pink boxes**: AI/Enhancement features
- **Orange boxes**: Intermediate processing
- **Red boxes**: Error states
- **Dotted lines**: Optional/feedback paths
- **Solid lines**: Required flow paths

## Notes

1. All diagrams use Mermaid syntax for easy rendering in documentation
2. Flows are designed to be modular and interchangeable
3. Each stage maintains its own error handling
4. Context is preserved throughout the entire pipeline
5. User can intervene at any stage for modifications
6. System supports both synchronous and asynchronous processing
7. All operations are logged for debugging and analytics
8. Performance metrics are collected at each stage