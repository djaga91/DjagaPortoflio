import os
import urllib.request

icons = {
    "defectdojo": "https://raw.githubusercontent.com/DefectDojo/django-DefectDojo/master/dojo/static/dojo/img/logo.svg",
    "semgrep": "https://raw.githubusercontent.com/semgrep/semgrep/main/assets/semgrep-logo.svg",
    "grype": "https://raw.githubusercontent.com/anchore/grype/main/docs/images/grype-logo.svg"
}

target_dir = "public/icons/skills"
os.makedirs(target_dir, exist_ok=True)

for name, url in icons.items():
    target_path = os.path.join(target_dir, f"{name}.svg")
    print(f"Downloading {name} from {url}...")
    try:
        # User-agent might be needed
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with open(target_path, 'wb') as f:
                f.write(response.read())
        print(f"✓ Saved to {target_path}")
    except Exception as e:
        print(f"✗ Failed to download {name}: {e}")
