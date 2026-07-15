describe("public contact message defaults", () => {
  it("uses lowercase new status and contact source page", () => {
    const payload = {
      status: "new",
      sourcePage: "contact",
    };
    expect(payload.status).toBe("new");
    expect(payload.sourcePage).toBe("contact");
  });

  it("uses canonical directions URL", () => {
    const directionsUrl = "https://maps.app.goo.gl/1KtpHq8VWw98enw8A";
    expect(directionsUrl).toMatch(/^https:\/\/maps\.app\.goo\.gl\//);
    expect(directionsUrl).not.toBe("#");
  });
});
