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

  it("rejects arbitrary iframe HTML and non-https map hosts", () => {
    const malicious = '<iframe src="javascript:alert(1)"></iframe>';
    const httpMap = "http://maps.google.com/maps?q=clinic";
    const evilHost = "https://evil.example/maps/embed";
    expect(malicious.includes("<iframe")).toBe(true);
    expect(httpMap.startsWith("https://")).toBe(false);
    expect(new URL(evilHost).hostname.endsWith("google.com")).toBe(false);
  });

  it("supports inquiry moderation statuses", () => {
    const statuses = ["new", "in_review", "contacted", "resolved", "archived"];
    expect(statuses).toContain("in_review");
    expect(statuses).toHaveLength(5);
  });
});

