export class UserInputHandler {
  private lastTimeUserInputProcessed = 0;
  private userInputInterval = 1000 / 60; // Process user input at 60 FPS

  // === USer input ===
  public triggerOnUserInput() {
    if (!this.shouldUpdateUserInput(Date.now())) return;

    // TODO:
  }

  private shouldUpdateUserInput(timestamp: number): boolean {
    const shouldUpdate = timestamp - this.lastTimeUserInputProcessed >= this.userInputInterval;
    if (shouldUpdate) {
      this.lastTimeUserInputProcessed = timestamp;
      return true;
    }
    return false;
  }
  // === USer input  End ===
}
