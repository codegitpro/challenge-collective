-   A source control repo of your preference containing incremental commits.
    I have made reasonable commit number and done task under the several PRs based on rebase git workflow
    Just download it as zip file from my personal github source code.
    I believe you can check my working history from commit history

-   Starting with the sample code prior to your refactor.

-   Whatever tests make sense to support the original and your refactor, assuming there is no test coverage currently.

We will need the following data for the full testing

1. google map api key for auto complete input
2. mock store workflow about transaction data structure
3. reasonable style module or basic design

-   Explanations of why you made the refactors that you did and what you omitted and why.

I have made bunch of refactoring aboutTransitionInput component

1. I have made source code based on atomic design paradigm for the scalable app development
2. I have made 3 reusable atom level components (AutoComplete, Select, Panel)
   The reason that I have made them,
   first, we can split those logic (autocomplete geo functionality, select UX, panel edit/save/cancel UX logic) from the transitionInput
   and handle them separately. so we can reduce the component complexity
   second, I just tried to split the transition component codebase into 2 types small components (active, passive), so that we can handle
   or debug easily
3. I have implemented the typescript interface logic for making type-strict codebase so that we can prevent potential bugs that could be caused
   by data serizliation /deserilaization of store data
   4 I have tried to transitioninput component renderinng part as much as possible based on its input type
4. I have tried to refactor its actions into 2 types (one is component UI/UX/state handling part, second is store data updpate/fetching/save part)
