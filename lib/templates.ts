export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    content: "",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Process flow with decisions",
    content: `flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B`,
  },
  {
    id: "er-diagram",
    name: "ER Diagram",
    description: "Entity relationships",
    content: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int id
        date created
        string status
    }
    LINE_ITEM {
        int quantity
        float price
    }`,
  },
  {
    id: "sequence",
    name: "Sequence",
    description: "Message interactions",
    content: `sequenceDiagram
    participant Client
    participant Server
    participant Database

    Client->>Server: HTTP Request
    Server->>Database: Query
    Database-->>Server: Results
    Server-->>Client: JSON Response`,
  },
  {
    id: "class-diagram",
    name: "Class Diagram",
    description: "Class inheritance",
    content: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    class Cat {
        +purr()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
];

export const DEFAULT_FILE_CONTENT = DIAGRAM_TEMPLATES.find(
  (t) => t.id === "er-diagram",
)!.content;
